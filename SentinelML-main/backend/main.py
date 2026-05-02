import time
import asyncio
import os
import uuid
import random
import numpy as np
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Body, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from collections import deque
import httpx
import logging

from model import MLModel
from defender import Defender
from blocker import Blocker
from simulator import Simulator
from threat_intel import get_mitre_tag, get_label_name
from integrity import store_model_hash, verify_model_hash, log_event, get_audit_log, verify_chain
from extractor_detector import ExtractionDetector
from adversarial_attacker import AdversarialAttacker
from rate_limiter import TrainRateLimiter
import ai
import incident_engine
import cluster_engine
import reputation_engine
from dotenv import load_dotenv

load_dotenv()


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Telegram Push Notifications
_telegram_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
_telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID", "")

async def send_telegram_alert(message: str):
    """Send a push notification via Telegram Bot API."""
    global _telegram_token, _telegram_chat_id
    if not _telegram_token or not _telegram_chat_id:
        return
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://api.telegram.org/bot{_telegram_token}/sendMessage",
                json={
                    "chat_id": _telegram_chat_id,
                    "text": message,
                    "parse_mode": "Markdown"
                },
                timeout=5
            )
    except Exception as e:
        logger.warning(f"Telegram alert failed: {e}")

app = FastAPI(title="SentinelML Backend")

@app.post("/config/telegram")
async def set_telegram_config(data: dict):
    global _telegram_token, _telegram_chat_id
    _telegram_token = data.get("token", _telegram_token)
    _telegram_chat_id = data.get("chat_id", _telegram_chat_id)
    return {"status": "updated", "chat_id_active": bool(_telegram_chat_id)}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sentinel-ml-main-1zks.vercel.app",
        "http://localhost:8001",   # Elyaitra backend calling /ingest-event
        "http://localhost:8080",   # Elyaitra frontend
        "http://localhost:5173",   # Elyaitra frontend (standard)
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "data", "model.pkl")

# Advanced Stores (Hackathon Hack)
attacker_profiles = {} # {ip: {events: [], ...}}
honeypot_log = []

def trigger_honeypot(ip, attack_type):
    """Triggered when an IP is blocked (3rd strike)."""
    entry = {
        "ip": ip,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "fake_response_sent": True,
        "decoy_data": "fake_credentials_bundle_v2",
        "lure_type": "credential_harvest"
    }
    honeypot_log.append(entry)
    logger.info(f"🍯 Honeypot Activated for {ip} after {attack_type}")

# Core Instances
model = MLModel()
defender = None
blocker = Blocker(strike_threshold=3, on_block_cb=trigger_honeypot)
simulator = Simulator()
extraction_detector = ExtractionDetector(risk_threshold=60)
adversarial_attacker = None
train_rate_limiter = None

# Traffic Log
traffic_feed = deque(maxlen=1000)
accepted_training_samples = []
stats = {
    "total_predictions": 0,
    "attacks_caught": 0,
    "adversarial_attempts": 0,
    "evasion_caught": 0,
    "poisoning_caught": 0,
    "start_time": time.time()
}

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)
        
        for connection in dead_connections:
            self.disconnect(connection)

manager = ConnectionManager()

@app.websocket("/ws/threats")
async def websocket_threats(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

# Schemas
class PredictRequest(BaseModel):
    features: List[float]
    ip: str

class TrainRequest(BaseModel):
    features: List[float]
    label: int
    ip: str

class SimulateRequest(BaseModel):
    mode: str
    count: Optional[int] = 1
    ip: Optional[str] = None

IP_POOL = [
    "45.12.23.8",     # Europe
    "103.21.244.1",   # Asia
    "181.65.23.9",    # South America
    "77.88.55.2",     # Russia
    "8.8.8.8",        # USA
    "52.174.12.34",   # Europe cloud
    "13.233.12.1",    # India
    "41.203.64.2"     # Africa
]

FALLBACK_COORDINATES = {
    "45.12.23.8": {"country": "France", "city": "Paris", "lat": 48.85, "lng": 2.35},
    "103.21.244.1": {"country": "Japan", "city": "Tokyo", "lat": 35.68, "lng": 139.76},
    "181.65.23.9": {"country": "Brazil", "city": "Sao Paulo", "lat": -23.55, "lng": -46.63},
    "77.88.55.2": {"country": "Russia", "city": "Moscow", "lat": 55.75, "lng": 37.61},
    "8.8.8.8": {"country": "USA", "city": "San Francisco", "lat": 37.77, "lng": -122.41},
    "52.174.12.34": {"country": "UK", "city": "London", "lat": 51.5, "lng": -0.12},
    "13.233.12.1": {"country": "India", "city": "Mumbai", "lat": 19.07, "lng": 72.87},
    "41.203.64.2": {"country": "Kenya", "city": "Nairobi", "lat": -1.29, "lng": 36.82}
}

# Geolocation Helper
async def get_geo_info(ip: str):
    if ip == "127.0.0.1" or ip.startswith("192.168."):
        return {"country": "Local", "city": "Private Network", "lat": 0.0, "lng": 0.0}
        
    if ip in FALLBACK_COORDINATES:
        return FALLBACK_COORDINATES[ip]
        
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"http://ip-api.com/json/{ip}", timeout=2.0)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "success":
                    return {
                        "country": data.get("country", "Unknown"),
                        "city": data.get("city", "Unknown"),
                        "lat": data.get("lat", 34.05),
                        "lng": data.get("lon", -118.24)
                    }
    except Exception:
        pass
    
    # Absolute fallback to valid coordinates
    return {"country": "Unknown", "city": "Unknown", "lat": 38.87, "lng": -77.05}

@app.on_event("startup")
async def startup_event():
    global defender, adversarial_attacker, train_rate_limiter
    logger.info("Initializing SentinelML System...")
    
    # Load or initial train
    if not model.load():
        logger.info("No saved model found. Training initial model...")
        model.train()
    
    # Ensure model_history has at least one entry for the chart
    if not model.model_history:
        model.model_history.append({
            'ts': time.time(),
            'accuracy': model.accuracy,
            'f1': model.f1,
            'event': 'Initial Seed'
        })
    
    # Initialize dependent components
    defender = Defender(train_stats=model.train_stats)
    adversarial_attacker = AdversarialAttacker(model)
    train_rate_limiter = TrainRateLimiter(window_seconds=60, max_calls=10)
    
    store_model_hash(MODEL_PATH)
    
    # Task 25: Ensure feature_importances exist
    f_imp_path = os.path.join(os.path.dirname(__file__), "model_metadata", "feature_importances.json")
    if not os.path.exists(f_imp_path):
        from model import COLUMNS
        import joblib
        import json
        try:
            m = joblib.load(MODEL_PATH)
            features = [c for c in COLUMNS if c not in ["label", "difficulty_level"]]
            importance_dict = {n: float(i) for n, i in zip(features, m.feature_importances_)}
            sorted_imp = dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
            os.makedirs(os.path.dirname(f_imp_path), exist_ok=True)
            with open(f_imp_path, "w") as f:
                json.dump(sorted_imp, f, indent=2)
            logger.info("✅ Regenerated feature importances on startup.")
        except Exception as e:
            logger.error(f"Failed to generate feature importances: {e}")

    log_event({"event": "system_startup", "accuracy": model.accuracy})
    logger.info("System Ready.")

class ElyaitraEventPayload(BaseModel):
    ip: str
    source: str = "elyaitra"
    type: str
    severity: str = "MEDIUM"
    confidence: float = 0.8
    mitre_tags: List[str] = []
    description: str = ""
    timestamp: str = ""
    path: str = ""
    method: str = ""
    app: str = "Elyaitra RAG"
    session_id: Optional[str] = None
    honeypot_variant: Optional[str] = None

@app.post("/ingest-event")
async def ingest_event(payload: ElyaitraEventPayload):
    geo = await get_geo_info(payload.ip)
    
    attack_types = {"RAG_INJECTION", "RAG_RECON", "RAG_PROBE"}
    is_attack = payload.type in attack_types
    
    is_blocked = False
    if is_attack:
        is_blocked = blocker.record_strike(
            payload.ip, 
            is_adversarial=True, 
            attack_type=payload.type, 
            reason=payload.description
        )
        
        # 🛡️ Notify Extraction Radar (Dashboard)
        extraction_detector.record_query(
            payload.ip, 
            features=[0.95] * 41, # High-risk signature
            pred_label=1, 
            confidence=payload.confidence
        )
        if is_blocked:
            extraction_detector.honeypot_ips.add(payload.ip)
        
        if payload.confidence > 0.85:
            await send_telegram_alert(
                f"🛡️ *Elyaitra Security Alert*\n"
                f"Type: `{payload.type}`\n"
                f"IP: `{payload.ip}` | Path: `{payload.path}`\n"
                f"Status: {'🔴 BLOCKED' if is_blocked else '🟡 FLAGGED'}\n"
                f"Session: `{payload.session_id}`"
            )

    mitre_id = payload.mitre_tags[0] if payload.mitre_tags else "T1190"
    mitre_name = payload.description if payload.description else "Exploit Public-Facing Application"

    event_type = "attack" if is_attack else "normal"
    
    event = {
        "id": str(uuid.uuid4()),
        "timestamp": payload.timestamp or time.strftime("%Y-%m-%d %H:%M:%S"),
        "time": time.time(),
        "ip": payload.ip,
        "type": event_type,
        "label_name": payload.type,
        "mitre_id": mitre_id,
        "mitre_name": mitre_name,
        "confidence": payload.confidence,
        "evasion_score": 0.0,
        "status": "blocked" if is_blocked else "allowed",
        "geo": geo,
        "features": [0.0] * 41,
        "reputation_score": 0,
        "reputation_label": "Unknown",
        "source": payload.source,
        "app": payload.app,
        "path": payload.path,
        "method": payload.method,
        "severity": payload.severity,
        "details": f"[{payload.type}] {payload.description}"
    }

    if is_attack:
        if payload.ip not in attacker_profiles:
            attacker_profiles[payload.ip] = {
                "ip": payload.ip,
                "first_seen": time.strftime("%Y-%m-%d %H:%M:%S"),
                "events": []
            }
        
        attacker_profiles[payload.ip]["events"].append({
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "attack_type": payload.type,
            "confidence_score": float(payload.confidence),
            "z_score_max": 0.0,
            "packet_features_summary": {"min": 0.0, "max": 0.0, "mean": 0.0}
        })
        attacker_profiles[payload.ip]["last_seen"] = time.strftime("%Y-%m-%d %H:%M:%S")

    traffic_feed.appendleft(event)
    incident_engine.update(event)
    await manager.broadcast(event)
    log_event({"event": "ingest_event", "ip": payload.ip, "type": event_type, "label": payload.type})

    # 🏛️ Task 13: Write flagged events to attack_events table
    if is_attack:
        try:
            import sqlite3
            db_path = os.path.join(os.path.dirname(__file__), "..", "..", "app.db")
            conn = sqlite3.connect(db_path)
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO attack_events 
                (timestamp, ip, attack_type, mitre_technique, raw_query, honeypot_served, session_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                event.get("timestamp"),
                payload.ip,
                payload.type,
                mitre_id,
                payload.description,
                payload.honeypot_variant,
                payload.session_id
            ))
            conn.commit()
            conn.close()
            logger.info(f"💾 Forensics | Logged {payload.type} for session {payload.session_id}")
        except Exception as e:
            logger.error(f"❌ Forensics DB Error: {e}")

    return {"status": "ingested", "type": payload.type, "ip": payload.ip}

@app.get("/explain/{event_id}")
async def explain_event(event_id: str):
    # Search in traffic_feed
    event = next((e for e in traffic_feed if e["id"] == event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found in recent traffic")
    
    # Get feature importances
    f_imp_path = os.path.join(os.path.dirname(__file__), "model_metadata", "feature_importances.json")
    try:
        import json
        with open(f_imp_path, "r") as f:
            importances = json.load(f)
    except:
        importances = {}
        
    top_features = list(importances.items())[:5]
    
    # AI Explanation
    from llm import generate_text
    
    prompt = (
        f"As a cybersecurity expert, explain why this network event was flagged as an attack or suspicious activity.\n"
        f"Event Type: {event['label_name']}\n"
        f"Evidence Type (MITRE): {event['mitre_id']} ({event['mitre_name']})\n"
        f"Confidence Score: {event['confidence']}\n"
        f"Top Model Features contributing to this: {top_features}\n\n"
        "Please provide a 1-2 sentence explanation that would help a security analyst understand the risk."
    )
    
    try:
        explanation = generate_text(prompt)
    except Exception as e:
        logger.error(f"AI explanation failed: {e}")
        explanation = "Automated analysis indicates typical signature patterns associated with the identified attack technique."
        
    return {
        "event_id": event_id,
        "class": event["label_name"],
        "confidence": event["confidence"],
        "mitre_technique": event["mitre_id"],
        "top_features": top_features,
        "explanation": explanation
    }

@app.post("/predict")
async def predict(req: PredictRequest):
    if len(req.features) != 41:
        raise HTTPException(status_code=400, detail="Must provide 41 features.")

    # if blocker.is_blocked(req.ip):
    #     raise HTTPException(status_code=403, detail="IP is blocked")

    # Model integrity check
    integrity_ok = verify_model_hash(MODEL_PATH)

    # 1. Reputation Check (Zero-Strike)
    rep = reputation_engine.check_ip(req.ip)
    if rep["is_high_risk"] and not blocker.is_blocked(req.ip):
        blocker.block_ip_manually(req.ip, reason=f"Global Threat Intel: {rep['label']} (Score: {rep['score']})")

    # 2. Evasion Check
    is_evasion, evasion_risk = defender.detect_evasion(req.features)

    # 2. Prediction
    pred_label, confidence = model.predict(req.features)

    # 3. Extraction detection + honeypot
    extraction_detector.record_query(req.ip, req.features, pred_label, confidence)
    is_honeypot = extraction_detector.is_honeypot(req.ip)
    extraction_risk = extraction_detector.get_ip_risk(req.ip)
    
    if is_honeypot:
        # Check if this IP just became a honeypot (we only want one alert for activation)
        # However, for simplicity and visibility, we'll alert on every poisoned request but with clearer labeling
        pred_label, confidence = extraction_detector.generate_poisoned_response(pred_label, confidence)
        await send_telegram_alert(
            f"🍯 *Model Extraction — Honeypot Active*\n"
            f"IP: `{req.ip}` | Risk: `{extraction_risk}%`\n"
            f"Action: Poisoned Response (Label Flip)\n"
            f"MITRE: `T1588.001` — Obtain Capabilities: Malware"
        )
    elif extraction_risk > 30:
        await send_telegram_alert(
            f"🔍 *Model Extraction Probe Detected*\n"
            f"IP: `{req.ip}` | Risk: `{extraction_risk}%`\n"
            f"Action: Monitoring via Extraction Engine\n"
            f"MITRE: `T1592` — Gather Victim Digital Information"
        )

    # 4. Blocker
    is_attack = pred_label != 0
    attack_type = "standard_attack"
    if is_evasion: attack_type = "evasion"
    
    is_blocked = blocker.record_strike(req.ip, is_adversarial=(is_attack or is_evasion),
                                       attack_type=attack_type,
                                       reason=f"{attack_type.replace('_', ' ').capitalize()} detected")

    # 5. Attacker Profiling
    if is_attack or is_evasion:
        if req.ip not in attacker_profiles:
            attacker_profiles[req.ip] = {
                "ip": req.ip,
                "first_seen": time.strftime("%Y-%m-%d %H:%M:%S"),
                "events": []
            }
        
        # Calculate summary features
        feats = np.array(req.features)
        summary = {
            "min": float(np.min(feats)),
            "max": float(np.max(feats)),
            "mean": float(np.mean(feats))
        }
        
        attacker_profiles[req.ip]["events"].append({
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "attack_type": attack_type,
            "confidence_score": float(confidence),
            "z_score_max": float(evasion_risk / 10), # scale back to z-score approx
            "packet_features_summary": summary
        })
        attacker_profiles[req.ip]["last_seen"] = time.strftime("%Y-%m-%d %H:%M:%S")

    # MITRE tagging
    mitre = get_mitre_tag(pred_label)
    label_name = get_label_name(pred_label)

    # Telegram alert for attacks
    if is_attack:
        await send_telegram_alert(
            f"⚔️ *MITRE ATT&CK Alert*\n"
            f"Technique: `{mitre['id']}` — {mitre['name']}\n"
            f"Tactic: `{mitre['tactic']}`\n"
            f"IP: `{req.ip}` | Confidence: `{round(confidence * 100, 1)}%`\n"
            f"Status: {'🔴 BLOCKED' if is_blocked else '🟡 FLAGGED'}"
        )

    geo = await get_geo_info(req.ip)
    event_type = "attack" if is_attack else "normal"
    if is_evasion: event_type = "evasion"

    event = {
        "id": str(uuid.uuid4()),
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "time": time.time(),
        "ip": req.ip,
        "type": event_type,
        "label_name": label_name,
        "mitre_id": mitre["id"],
        "mitre_name": mitre["name"],
        "confidence": confidence,
        "evasion_score": evasion_risk,
        "status": "blocked" if is_blocked else "allowed",
        "geo": geo,
        "features": req.features,
        "reputation_score": rep["score"],
        "reputation_label": rep["label"]
    }
    incident_engine.update(event)
    traffic_feed.appendleft(event)
    await manager.broadcast(event)
    log_event({"event": "predict", "ip": req.ip, "type": event_type, "label": pred_label})

    stats["total_predictions"] += 1
    if is_attack: stats["attacks_caught"] += 1
    if is_evasion:
        stats["adversarial_attempts"] += 1
        stats["evasion_caught"] += 1

    return {
        "label": pred_label,
        "label_name": label_name,
        "confidence": confidence,
        "evasion_score": evasion_risk,
        "blocked": is_blocked,
        "geo": geo,
        "mitre": mitre,
        "is_honeypot": is_honeypot,
        "integrity_ok": integrity_ok
    }

@app.post("/train")
async def train_endpoint(req: TrainRequest):
    # if blocker.is_blocked(req.ip):
    #     raise HTTPException(status_code=403, detail="IP is blocked")

    # Task 3: Rate Limiting
    allowed, count, reset_in = train_rate_limiter.check_and_record(req.ip)
    if not allowed:
        raise HTTPException(status_code=429, detail=f"Rate limit: {count} training calls in 60s. Retry in {reset_in}s.")

    rep = reputation_engine.check_ip(req.ip)
    if rep["is_high_risk"] and not blocker.is_blocked(req.ip):
        blocker.block_ip_manually(req.ip, reason=f"Global Threat Intel (Poisoning risk): {rep['label']} (Score: {rep['score']})")

    pred_label, confidence = model.predict(req.features)
    is_poisoning = defender.detect_poisoning(req.features, req.label, pred_label, confidence)
    
    attack_type = "poisoning"
    is_blocked = blocker.record_strike(req.ip, is_adversarial=is_poisoning, 
                                       attack_type=attack_type,
                                       reason="Poisoning attempt detected")

    if is_poisoning:
        if req.ip not in attacker_profiles:
            attacker_profiles[req.ip] = {
                "ip": req.ip,
                "first_seen": time.strftime("%Y-%m-%d %H:%M:%S"),
                "events": []
            }
        
        feats = np.array(req.features)
        summary = {"min": float(np.min(feats)), "max": float(np.max(feats)), "mean": float(np.mean(feats))}
        
        attacker_profiles[req.ip]["events"].append({
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "attack_type": attack_type,
            "confidence_score": float(confidence),
            "z_score_max": 0.0,
            "packet_features_summary": summary
        })
        attacker_profiles[req.ip]["last_seen"] = time.strftime("%Y-%m-%d %H:%M:%S")

    geo = await get_geo_info(req.ip)
    event = {
        "id": str(uuid.uuid4()),
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "time": time.time(),
        "ip": req.ip,
        "type": "poison" if is_poisoning else "train",
        "confidence": 1.0,
        "status": "blocked" if is_blocked else "allowed",
        "geo": geo,
        "features": req.features,
        "reputation_score": rep["score"],
        "reputation_label": rep["label"]
    }
    incident_engine.update(event)
    traffic_feed.appendleft(event)
    log_event({"event": "train", "ip": req.ip, "is_poisoning": is_poisoning})

    if is_poisoning:
        stats["adversarial_attempts"] += 1
        stats["poisoning_caught"] += 1
        return {"status": "rejected", "is_poisoning": True, "blocked": is_blocked}

    accepted_training_samples.append({'features': req.features, 'label': req.label})
    return {"status": "accepted", "is_poisoning": False, "blocked": False}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/siem-log")
async def get_siem_log():
    entries = list(traffic_feed)[:500]
    return [
        {
            "timestamp": e.get("timestamp"),
            "source_ip": e.get("ip"),
            "event_type": e.get("type"),
            "mitre_id": e.get("mitre_id", "N/A"),
            "mitre_name": e.get("mitre_name", ""),
            "incident_id": e.get("incident_id", "N/A"),
            "severity": e.get("severity", "info").upper(),
            "status": e.get("status"),
        }
        for e in entries
    ]

@app.post("/reset")
async def reset_system():
    traffic_feed.clear()
    incident_engine.reset()
    accepted_training_samples.clear()
    blocker.blocked_ips.clear()
    blocker.strikes.clear()
    extraction_detector.reset()
    if train_rate_limiter:
        train_rate_limiter.reset_all()
    attacker_profiles.clear()
    honeypot_log.clear()
    stats["total_predictions"] = 0
    stats["attacks_caught"] = 0
    stats["adversarial_attempts"] = 0
    stats["evasion_caught"] = 0
    stats["poisoning_caught"] = 0
    return {"status": "reset"}

@app.get("/traffic-feed")
async def get_traffic_feed():
    return list(traffic_feed)

@app.get("/blocked-ips")
async def get_blocked_ips():
    return blocker.get_blocked_ips()

@app.get("/blocked-ips-detail")
async def get_blocked_ips_detail():
    blocked = blocker.get_blocked_ips()
    detailed = []
    for ip, info in blocked.items():
        # Count all events from profile if it exists
        total_intercepted = len(attacker_profiles.get(ip, {}).get("events", []))
        detailed.append({
            "ip": ip,
            "blocked_at": info["timestamp"],
            "reason": info["reason"],
            "total_packets_intercepted": total_intercepted
        })
    return detailed

@app.post("/reset-extraction")
async def reset_extraction():
    extraction_detector.reset()
    return {"status": "success", "message": "Extraction detector state cleared"}

@app.post("/toggle-honeypot")
async def toggle_honeypot():
    extraction_detector.global_enabled = not extraction_detector.global_enabled
    state = "enabled" if extraction_detector.global_enabled else "disabled"
    return {"status": "success", "enabled": extraction_detector.global_enabled, "message": f"Honeypot defense {state}"}

@app.get("/honeypot-log")
async def get_honeypot_log_endpoint():
    return honeypot_log

@app.get("/attacker-profiles")
async def get_attacker_profiles_endpoint():
    profiles = []
    blocked = blocker.get_blocked_ips()
    
    for ip, p in attacker_profiles.items():
        events = p["events"]
        types = list(set([e["attack_type"] for e in events]))
        
        # Derive behaviour pattern
        if all(e["attack_type"] == events[0]["attack_type"] for e in events):
            pattern = f"Specialized {events[0]['attack_type'].replace('_', ' ').capitalize()}"
        elif len(types) > 1:
            pattern = "Adaptive Threat Actor"
        else:
            pattern = "Anomalous Behaviour"
            
        # Escalating evasion check
        evasions = [e for e in events if e["attack_type"] == "evasion"]
        if len(evasions) >= 2:
            # Check if z_score_max is increasing
            z_scores = [e["z_score_max"] for e in evasions]
            if z_scores[-1] > z_scores[0]:
                pattern = "Escalating Evasion Pattern"

        # Calculate risk score
        avg_conf = sum([e["confidence_score"] for e in events]) / len(events) if events else 0
        risk_score = min(100, len(events) * 10 + avg_conf * 50)
        
        threat_level = "LOW"
        if risk_score > 80: threat_level = "CRITICAL"
        elif risk_score > 60: threat_level = "HIGH"
        elif risk_score > 40: threat_level = "MEDIUM"

        profiles.append({
            "ip": ip,
            "total_strikes": len(blocker.strikes.get(ip, [])),
            "is_blocked": ip in blocked,
            "attack_types_used": types,
            "first_seen": p["first_seen"],
            "last_seen": p["last_seen"],
            "events": events,
            "behaviour_pattern": pattern,
            "risk_score": round(risk_score, 1),
            "threat_level": threat_level
        })
    return profiles

@app.post("/block-ip")
async def manually_block_ip(ip: str = Body(..., embed=True)):
    blocker.block_ip_manually(ip)
    return {"status": "success", "ip": ip}

@app.delete("/block-ip/{ip}")
async def unblock_ip(ip: str):
    success = blocker.unblock_ip(ip)
    return {"status": "success" if success else "not_found"}

@app.delete("/block-ip")
async def unblock_all_ips():
    success = blocker.unblock_all()
    return {"status": "success"}

@app.get("/train-rate-status")
async def get_train_rate_status():
    return train_rate_limiter.get_status()

@app.get("/model-stats")
async def get_model_stats():
    uptime = time.time() - stats["start_time"]
    integrity_ok = verify_model_hash(MODEL_PATH)
    extraction_status = extraction_detector.get_status()
    return {
        "accuracy": round(model.accuracy, 4),
        "f1": round(model.f1, 4),
        "total_predictions": stats["total_predictions"],
        "attacks_caught": stats["attacks_caught"],
        "adversarial_attempts": stats["adversarial_attempts"],
        "evasion_caught": stats["evasion_caught"],
        "poisoning_caught": stats["poisoning_caught"],
        "extraction_attempts": extraction_status["total_extraction_attempts"],
        "honeypot_activations": extraction_status["honeypot_activations"],
        "integrity_ok": integrity_ok,
        "uptime": round(uptime / 3600, 2)
    }

@app.post("/retrain")
async def retrain():
    global defender, adversarial_attacker
    logger.info("Manual retrain triggered.")
    
    prev_accuracy = model.accuracy
    prev_f1 = model.f1
    
    model.train(new_samples=accepted_training_samples)
    accepted_training_samples.clear()
    
    defender = Defender(train_stats=model.train_stats)
    adversarial_attacker = AdversarialAttacker(model)
    
    store_model_hash(MODEL_PATH)
    
    # Task 4: Drift Alerting
    drift = model.check_drift(prev_accuracy, prev_f1)
    if drift["drifted"]:
        log_event({"event": "accuracy_drift_alert", **drift})
        await send_telegram_alert(
            f"📉 *Model Drift Alert — SentinelML SIEM*\n"
            f"Accuracy dropped: `{round(prev_accuracy * 100, 2)}%` → `{round(model.accuracy * 100, 2)}%`\n"
            f"F1 Score: `{round(prev_f1, 4)}` → `{round(model.f1, 4)}`\n"
            f"⚠️ Investigate model integrity immediately."
        )
        
    log_event({"event": "retrain", "accuracy": model.accuracy, "f1": model.f1})
    return {
        "status": "success", 
        "new_accuracy": round(model.accuracy, 4), 
        "new_f1": round(model.f1, 4),
        "drift_alert": drift
    }

@app.get("/model-versions")
async def get_model_versions():
    return model.list_versions()

@app.post("/model-rollback")
async def model_rollback(payload: dict = Body(...)):
    version_id = payload.get("version_id")
    if not version_id:
        raise HTTPException(400, "version_id is required")
    
    try:
        result = model.rollback(version_id)
    except ValueError as e:
        raise HTTPException(404, str(e))
    
    global defender, adversarial_attacker
    defender = Defender(train_stats=model.train_stats)
    adversarial_attacker = AdversarialAttacker(model)
    
    store_model_hash(MODEL_PATH)
    log_event({"event": "rollback", "version_id": version_id, "accuracy": model.accuracy})
    return result

@app.get("/drift-alerts")
async def get_drift_alerts():
    entries = get_audit_log(n=200)
    filtered = [e for e in entries if e.get("event") == "accuracy_drift_alert"]
    return filtered[:50]

@app.get("/model-history")
async def get_model_history():
    return model.model_history

@app.get("/extraction-status")
async def get_extraction_status():
    return extraction_detector.get_status()

@app.get("/threat-score")
async def get_threat_score():
    blocked_count = len(blocker.get_blocked_ips())
    total = max(stats["total_predictions"], 1)
    evasion_rate = stats["evasion_caught"] / total
    poison_rate = stats["poisoning_caught"] / total
    accuracy = model.accuracy if model.accuracy > 0 else 0.98

    raw = (
        blocked_count * 8 +
        evasion_rate * 40 +
        poison_rate * 30 +
        (1 - accuracy) * 100
    )
    score = int(min(100, max(0, raw)))
    if score < 25: band = "LOW"
    elif score < 50: band = "MEDIUM"
    elif score < 75: band = "HIGH"
    else: band = "CRITICAL"

    return {"score": score, "band": band}

@app.get("/audit")
async def get_audit():
    entries = get_audit_log(n=50)
    chain_valid = verify_chain()
    return {"entries": entries, "chain_valid": chain_valid}

@app.get("/verify-integrity")
async def verify_integrity():
    ok = verify_model_hash(MODEL_PATH)
    return {"integrity_ok": ok, "model_hash": ok}

@app.get("/ai-summary")
async def get_ai_summary():
    recent_events = list(traffic_feed)[:50]
    summary = ai.generate_incident_summary(recent_events)
    return {"summary": summary}

@app.post("/ai-explain")
async def get_ai_explain(payload: dict = Body(...)):
    event_id = payload.get("event_id")
    # In a real system, we'd query by ID. For now we just pass the event dict if provided,
    # or find from feed.
    event = payload.get("event")
    if not event and event_id:
        for e in traffic_feed:
            if e["id"] == event_id:
                event = e
                break
    
    if not event:
        return {"explanation": "Event not found or no event data provided."}
        
    explanation = ai.explain_event(event)
    return {"explanation": explanation}

@app.get("/ai-insights")
async def get_ai_insights():
    try:
        recent_events = list(traffic_feed)[:50]
        summary = ai.generate_incident_summary(recent_events)
        
        # Calculate some threat assessment internally
        total_events = len(recent_events)
        attacks = sum(1 for e in recent_events if e.get("type") in ["attack", "evasion", "poison"])
        
        threat_assessment = "LOW"
        if attacks > total_events * 0.5:
            threat_assessment = "CRITICAL"
        elif attacks > total_events * 0.2:
            threat_assessment = "HIGH"
        elif attacks > 0:
            threat_assessment = "MEDIUM"
            
        key_patterns = "Normal operations"
        types_seen = [e.get("type") for e in recent_events]
        if "attack" in types_seen:
            key_patterns = "Active malicious traffic detected"
        if "evasion" in types_seen:
            key_patterns = "Sophisticated evasion attempts detected"
            
        return {
            "summary": summary,
            "key_patterns": key_patterns,
            "threat_assessment": threat_assessment
        }
    except Exception as e:
        logger.error(f"AI Insights failed: {e}")
        return {
            "summary": "AI Intelligence module is temporarily offline. System stats indicate stable operation with active monitoring.",
            "key_patterns": "Monitoring Active",
            "threat_assessment": "LOW"
        }

@app.post("/simulate")
async def simulate(req: SimulateRequest):
    count = req.count or 1
    used_ips = []

    for _ in range(count):
        ip = req.ip or simulator.get_random_ip(mode=req.mode)
        used_ips.append(ip)

        if blocker.is_blocked(ip):
            blocker.unblock_ip(ip)

        if req.mode == "normal":
            f = simulator.generate_normal()
            await predict(PredictRequest(features=f, ip=ip))
        elif req.mode == "evasion":
            f = simulator.generate_evasion()
            await predict(PredictRequest(features=f, ip=ip))
        elif req.mode == "poison":
            f, l = simulator.generate_poison()
            await train_endpoint(TrainRequest(features=f, label=l, ip=ip))
        elif req.mode == "fgsm":
            f = simulator.generate_evasion()
            adv = adversarial_attacker.fgsm(f, target_class=0, epsilon=0.1)
            await predict(PredictRequest(features=adv, ip=ip))
        elif req.mode == "pgd":
            f = simulator.generate_evasion()
            adv = adversarial_attacker.pgd(f, target_class=0, epsilon=0.1, iterations=10)
            await predict(PredictRequest(features=adv, ip=ip))
        elif req.mode == "blitz":
            f, mode = simulator.generate_blitz()
            if mode == "poison":
                await train_endpoint(TrainRequest(features=f[0], label=f[1], ip=ip))
            else:
                await predict(PredictRequest(features=f, ip=ip))
        elif req.mode in ("extraction", "extraction_blitz"):
            f = simulator.generate_extraction_probe(probe_type="boundary" if req.mode == "extraction_blitz" else "coverage")
            await predict(PredictRequest(features=f, ip=ip))
        elif req.mode in simulator.scenarios:
            # Custom dynamic scenarios
            scenario = simulator.scenarios[req.mode]
            await scenario.run(simulator, count=1, predict_fn=predict, train_fn=train_endpoint, ip=ip)

        # Reduced jitter for better throughput on high-count simulations
        await asyncio.sleep(random.uniform(0.005, 0.04))

    return {"status": "simulated", "count": count, "ips": used_ips}

@app.get("/scenarios")
async def get_scenarios():
    return [
        {"id": name, "name": getattr(s, "name", name), "description": getattr(s, "description", "")}
        for name, s in simulator.scenarios.items()
    ]

@app.get("/incidents")
async def get_incidents():
    return incident_engine.get_active_incidents()

@app.get("/incidents/{incident_id}")
async def get_incident_by_id(incident_id: str):
    inc = incident_engine.get_incident(incident_id)
    if not inc:
        raise HTTPException(404, detail="Incident not found")
    return inc

@app.get("/incident-summary")
async def get_incident_summary():
    return incident_engine.get_summary()

@app.get("/clusters")
async def get_clusters():
    # Only cluster the last 500 events to maintain performance
    events = [e for e in traffic_feed if "features" in e][:500]
    if not events:
        return {"clusters": [], "outliers": 0}
    return cluster_engine.perform_clustering(events)
