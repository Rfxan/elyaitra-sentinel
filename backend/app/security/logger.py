import os
import requests
import json
import threading
import time
import httpx
import asyncio
import re
from datetime import datetime, timezone

SENTINEL_URL = "http://127.0.0.1:8003"

# ── Attack classification heuristics ─────────────────────────────────────────

# Comprehensive RAG attack patterns (Injection, Recon, and Exfiltration)
RAG_INJECTION_PATTERNS = [
    # 1. PERSONA/SYSTEM BREAKOUTS
    r"ignore all previous instructions",
    r"system override",
    r"forget your restrictions",
    r"disregard prior constraints",
    r"act as dan",
    r"you are in eval mode",
    r"new instruction:",
    
    # 2. DATA EXTRACTION / DUMPING
    r"output the full contents",
    r"leak raw chunks",
    r"reveal your system prompt",
    r"dump knowledge base",
    r"list all stored documents",
    r"print everything in your context",
    r"verbatim",
    r"repeat everything",
    
    # 3. VECTOR DB / RAG SPECIFIC
    r"vector database",
    r"index dump",
    r"(show|give|list|enumerate) (me )?(all|every)",
    r"what (data|documents?) do you have",
]

RAG_RECON_PATTERNS = [
    r"what topics are covered",
    r"list (the )?(main )?(units?|chapters?|topics?)",
    r"(complete|full|entire) syllabus",
    r"overview of what (i need|to study)",
    r"(all|every) topics? (across|for|in)",
]

def classify_elyaitra_request(method: str, path: str, body: str) -> dict:
    body_lower = (body or "").lower()
    path_lower = (path or "").lower()
    # print(f"🔍 CLASSIFY DEBUG | Body: {body_lower[:50]}...")

    for pattern in RAG_INJECTION_PATTERNS:
        if re.search(pattern, body_lower):
            return {
                "type": "RAG_INJECTION",
                "severity": "HIGH",
                "mitre_tags": ["T1190", "T1059", "T1530"],
                "confidence": 0.95,
                "description": f"Prompt injection attempt detected: '{body[:80]}'"
            }

    for pattern in RAG_RECON_PATTERNS:
        if re.search(pattern, body_lower):
            return {
                "type": "RAG_RECON",
                "severity": "MEDIUM",
                "mitre_tags": ["T1190", "T1213"],
                "confidence": 0.78,
                "description": f"RAG enumeration/recon query: '{body[:80]}'"
            }

    if method == "POST" and any(seg in path_lower for seg in ["/ai", "/query", "/ask", "/chat", "/answer"]):
        return {
            "type": "RAG_PROBE",
            "severity": "LOW",
            "mitre_tags": ["T1190"],
            "confidence": 0.55,
            "description": f"AI endpoint probe: {method} {path}"
        }

    return {
        "type": "NORMAL",
        "severity": "LOW",
        "mitre_tags": [],
        "confidence": 0.10,
        "description": f"Normal request: {method} {path}"
    }

async def forward_to_sentinel(ip: str, method: str, path: str, body: str) -> None:
    classification = classify_elyaitra_request(method, path, body)
    print(f"🛡️ SECURITY DEBUG | IP: {ip} | Type: {classification['type']} | Path: {path}")

    if classification["type"] == "NORMAL":
        return

    print(f"📡 TELEMETRY | Forwarding {classification['type']} to SentinelML...")
    payload = {
        "ip": ip,
        "source": "elyaitra",
        "type": classification["type"],
        "severity": classification["severity"],
        "confidence": classification["confidence"],
        "mitre_tags": classification["mitre_tags"],
        "description": classification["description"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "path": path,
        "method": method,
        "app": "Elyaitra RAG",
    }

    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            await client.post(
                f"{SENTINEL_URL}/ingest-event",
                json=payload,
            )
    except Exception:
        pass

def _perform_log_request(log: dict):
    try:
        security_url = os.getenv("SECURITY_URL")
        
        # 1. Local Security Log
        if security_url:
            try:
                requests.post(security_url, json=log, timeout=0.2)
            except Exception:
                pass

        # 2. Forward to SentinelML
        ip = log.get("ip", "unknown")
        method = log.get("method", "GET")
        path = log.get("path", "/")
        body = log.get("body", "")
        
        classification = classify_elyaitra_request(method, path, body)
        
        print(f"🛡️ SECURITY | IP: {ip} | Type: {classification['type']} | Path: {path}")

        if classification["type"] != "NORMAL":
            print(f"📡 TELEMETRY | Sending {classification['type']} to SentinelML...")
            payload = {
                "ip": ip,
                "source": "elyaitra",
                "type": classification["type"],
                "severity": classification["severity"],
                "confidence": classification["confidence"],
                "mitre_tags": classification["mitre_tags"],
                "description": classification["description"],
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "path": path,
                "method": method,
                "app": "Elyaitra RAG",
                "session_id": log.get("session_id"),
                "honeypot_variant": log.get("honeypot_variant"),
            }
            resp = requests.post(f"{SENTINEL_URL}/ingest-event", json=payload, timeout=1.0)
            print(f"✅ TELEMETRY | SentinelML Response: {resp.status_code}")

        # 3. Local DB Log for Integrity Scoring
        from app.db.database import SessionLocal
        from app.models.user_request import UserRequest
        
        db_session = SessionLocal()
        try:
            # Try to extract user_id from body
            user_id = None
            if body:
                import json
                try:
                    body_json = json.loads(body)
                    user_id = body_json.get("user_id")
                except:
                    pass
            
            new_req = UserRequest(
                user_id=user_id,
                ip=ip,
                path=path,
                query_text=body,
                is_malicious=(classification["type"] != "NORMAL"),
                timestamp=datetime.fromtimestamp(log.get("timestamp", time.time()), timezone.utc).replace(tzinfo=None)
            )
            db_session.add(new_req)
            db_session.commit()
        finally:
            db_session.close()

    except Exception as e:
        print(f"❌ CRITICAL LOGGING ERROR: {e}")

def send_log(log: dict):
    """
    Public entrypoint for logging.
    - NON-BLOCKING: Dispatches to background thread.
    """
    if "timestamp" not in log:
        log["timestamp"] = time.time()
        
    # Non-blocking dispatch
    thread = threading.Thread(target=_perform_log_request, args=(log,))
    thread.daemon = True
    thread.start()

def get_honeypot_response(ip: str, query: str = "", topic: str = "General Syllabus") -> str:
    """
    Check if IP is blocked in SentinelML and return a deceptive response if so.
    Returns None if the IP is clean.
    """
    try:
        # 1. Check SentinelML for block status
        # In a high-traffic system, we would cache this
        with requests.Session() as s:
            resp = s.get(f"{SENTINEL_URL}/blocked-ips", timeout=0.5)
            if resp.status_code == 200:
                blocked_ips = resp.json()
                if ip in blocked_ips:
                    # 2. Return a deceptive honeypot answer (static or dynamic)
                    from app.honeypot_generator import generate_honeypot_response
                    
                    variant = os.getenv("HONEYPOT_MODE", "static")
                    print(f"🍯 DECEPTION | Serving {variant} honeypot to {ip} for topic: {topic}")
                    
                    # Log the variant to SentinelML via a separate ingestion if needed, 
                    # but for now we just return it. The caller logs the event.
                    
                    return generate_honeypot_response(query, topic)
    except Exception as e:
        print(f"❌ Honeypot Error: {e}")
    return None

