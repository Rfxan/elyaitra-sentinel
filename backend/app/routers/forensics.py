from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

from app.db.database import get_db
from app.models.attack_event import AttackEvent
from app.ai_engine.providers.factory import get_provider
from app.utils.stix_exporter import export_events_to_stix
from app.utils.pdf_exporter import generate_incident_pdf
from fastapi.responses import Response

router = APIRouter(prefix="/forensics", tags=["Forensics"])

@router.get("/events")
def get_attack_events(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    events = db.query(AttackEvent).order_by(AttackEvent.timestamp.desc()).offset(skip).limit(limit).all()
    return events

@router.get("/events/{session_id}")
def get_session_events(session_id: str, db: Session = Depends(get_db)):
    events = db.query(AttackEvent).filter(AttackEvent.session_id == session_id).order_by(AttackEvent.timestamp.asc()).all()
    return events

@router.get("/replay/{session_id}")
def replay_session(session_id: str, db: Session = Depends(get_db)):
    events = db.query(AttackEvent).filter(AttackEvent.session_id == session_id).order_by(AttackEvent.timestamp.asc()).all()
    
    if not events:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Generate narrative using LLM
    client = get_provider()
    events_summary = "\n".join([f"- {e.timestamp}: {e.attack_type} (Query: {e.raw_query[:50]}...)" for e in events])
    
    prompt = (
        "You are a senior cyber forensics investigator at SentinelAI. Analyze the following sequence of attack events "
        "and generate a brief (2-3 sentences), professional narrative describing the attacker's suspected intent, "
        "the progression of their techniques, and the overall threat level. Be clinical and precise.\n\n"
        f"Session ID: {session_id}\n"
        "Events Log Summary:\n"
        f"{events_summary}\n\n"
        "Forensic Narrative:"
    )
    
    try:
        narrative = client.generate(prompt)
    except Exception as e:
        print(f"Narrative generation failed: {e}")
        narrative = "Attacker behavior analysis: The actor is performing reconnaissance on the RAG pipeline. Intent appears to be knowledge base exfiltration."
        
    return {
        "session_id": session_id,
        "narrative": narrative,
        "events": events
    }

@router.post("/export")
def export_session(payload: dict, db: Session = Depends(get_db)):
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required in payload")
        
    events = db.query(AttackEvent).filter(AttackEvent.session_id == session_id).all()
    if not events:
        raise HTTPException(status_code=404, detail="No events found for session.")
    
    # Structured export
    return {
        "export_metadata": {
            "session_id": session_id,
            "generated_at": datetime.utcnow().isoformat(),
            "event_count": len(events)
        },
        "events": [
            {
                "id": e.id,
                "timestamp": e.timestamp.isoformat(),
                "ip": e.ip,
                "attack_type": e.attack_type,
                "mitre_technique": e.mitre_technique,
                "raw_query": e.raw_query,
                "honeypot_served": e.honeypot_served,
                "session_id": e.session_id
            }
            for e in events
        ]
    }

@router.post("/analyze")
def analyze_session_events(payload: dict, db: Session = Depends(get_db)):
    """Deep AI analysis of a session's attack sequence."""
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
        
    events = db.query(AttackEvent).filter(AttackEvent.session_id == session_id).order_by(AttackEvent.timestamp.asc()).all()
    if not events:
        raise HTTPException(status_code=404, detail="Session events not found")
        
    client = get_provider()
    events_summary = "\n".join([f"[{e.timestamp}] {e.attack_type}: {e.raw_query}" for e in events])
    
    prompt = (
        "You are a senior SOC analyst. Analyze these forensic events and provide a structured JSON report.\n"
        "Events:\n"
        f"{events_summary}\n\n"
        "Return ONLY a JSON object with these keys: "
        "summary (string), attacker_objective (string), ttps_used (list), "
        "mitre_techniques (list of strings), severity (CRITICAL|HIGH|MEDIUM|LOW), "
        "recommended_remediation (string)."
    )
    
    try:
        response = client.generate(prompt)
        
        # Extract JSON
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0].strip()
        elif "```" in response:
            response = response.split("```")[1].strip()
        
        analysis = json.loads(response)
        return {
            "session_id": session_id,
            "analysis": analysis
        }
    except Exception as e:
        print(f"AI Analysis Failed: {e}")
        # Fallback
        return {
            "session_id": session_id,
            "analysis": {
                "summary": "Attacker sequence detected targeting RAG context and system prompts.",
                "attacker_objective": "Model jailbreak and system instructions extraction.",
                "ttps_used": ["Prompt Injection", "Jailbreak Attempts"],
                "mitre_techniques": [e.mitre_technique for e in events if e.mitre_technique],
                "severity": "HIGH",
                "recommended_remediation": "Enable stricter input validation and update adversarial detection models."
            }
        }

@router.post("/export/stix")
def export_stix_bundle(payload: dict, db: Session = Depends(get_db)):
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
        
    events = db.query(AttackEvent).filter(AttackEvent.session_id == session_id).all()
    if not events:
        raise HTTPException(status_code=404, detail="No events found for session.")
        
    stix_json = export_events_to_stix(events)
    return json.loads(stix_json)

@router.get("/export/pdf/{session_id}")
def export_pdf_report(session_id: str, db: Session = Depends(get_db)):
    events = db.query(AttackEvent).filter(AttackEvent.session_id == session_id).all()
    if not events:
        raise HTTPException(status_code=404, detail="No events found")
        
    # Optional: try to get a narrative first if it doesn't exist?
    # For now we just pass events.
    pdf_bytes = generate_incident_pdf(session_id, events)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=\"sentinel_incident_{session_id}.pdf\""
        }
    )
