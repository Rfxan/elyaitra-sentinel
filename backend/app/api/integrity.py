from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer
from typing import List

from app.db.database import get_db
from app.models.user_request import UserRequest
from app.models.attack_event import AttackEvent

router = APIRouter(prefix="/integrity", tags=["Integrity Scoring"])

@router.get("/score/{session_id}")
def get_user_integrity_score(session_id: str, db: Session = Depends(get_db)):
    total_count = db.query(UserRequest).filter(UserRequest.session_id == session_id).count()
    if total_count == 0:
        return {"session_id": session_id, "score": 100.0, "status": "CLEAN", "total_queries": 0, "malicious_count": 0}
        
    malicious_count = db.query(UserRequest).filter(UserRequest.session_id == session_id, UserRequest.is_malicious == True).count()
    
    score = 100.0 - (malicious_count / total_count * 100.0)
    score = max(0.0, round(score, 2))
    
    status = "CLEAN"
    if score < 80: status = "SUSPICIOUS"
    if score < 50: status = "HIGH_RISK"
    if score < 20: status = "CRITICAL_RISK"
    
    return {
        "session_id": session_id,
        "score": score,
        "status": status,
        "total_queries": total_count,
        "malicious_count": malicious_count
    }

@router.get("/report/{session_id}")
def get_user_integrity_report(session_id: str, db: Session = Depends(get_db)):
    requests = db.query(UserRequest).filter(UserRequest.session_id == session_id).order_by(UserRequest.timestamp.asc()).all()
    
    report = []
    for req in requests:
        attack = None
        if req.is_malicious:
            # Try to find a matching attack event for this session near this time, or just any for this session that has attack_type
            # The prompt says: "For each request, check if a matching AttackEvent exists with same session_id to determine if flagged"
            # Since UserRequest doesn't have an attack_id, we'll look up AttackEvent by session_id and raw_query matching or closest.
            # Simplified: just get any attack event for this session
            attack = db.query(AttackEvent).filter(AttackEvent.session_id == session_id).first()
            
        report.append({
            "query_text": req.query_text,
            "timestamp": req.timestamp,
            "is_malicious": req.is_malicious,
            "attack_type": attack.attack_type if attack else None,
            "topic_detected": "General" # placeholder for topic
        })
        
    return report

@router.get("/leaderboard")
def get_integrity_leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    results = db.query(
        UserRequest.session_id,
        func.count(UserRequest.id).label("total"),
        func.sum(func.cast(UserRequest.is_malicious, Integer)).label("malicious")
    ).group_by(UserRequest.session_id).all()
    
    leaderboard = []
    for r in results:
        if r.session_id is None: continue
        total = r.total
        malicious = r.malicious or 0
        score = 100.0 - (malicious / total * 100.0)
        
        status = "CLEAN"
        if score < 80: status = "SUSPICIOUS"
        if score < 50: status = "HIGH_RISK"
        if score < 20: status = "CRITICAL_RISK"
        
        leaderboard.append({
            "session_id": r.session_id,
            "total_queries": total,
            "bypass_attempts": malicious,
            "score": round(score, 2),
            "status": status
        })
        
    leaderboard.sort(key=lambda x: x["score"], reverse=False) # Worst first (ascending)
    return leaderboard[:limit]


@router.get("/stats")
def get_integrity_stats(db: Session = Depends(get_db)):
    """Fleet-wide integrity statistics for the dashboard."""
    results = db.query(
        UserRequest.session_id,
        func.count(UserRequest.id).label("total"),
        func.sum(func.cast(UserRequest.is_malicious, Integer)).label("malicious")
    ).group_by(UserRequest.session_id).all()
    
    if not results:
        return {"avg_integrity": 100.0, "total_users": 0, "risk_distribution": {"clean": 0, "suspicious": 0, "critical": 0}}
    
    scores = []
    risk_dist = {"clean": 0, "suspicious": 0, "critical": 0}
    for r in results:
        if r.session_id is None: continue
        total = r.total
        malicious = r.malicious or 0
        score = 100.0 - (malicious / total * 100.0)
        scores.append(score)
        if score > 80:
            risk_dist["clean"] += 1
        elif score > 50:
            risk_dist["suspicious"] += 1
        else:
            risk_dist["critical"] += 1
    
    avg = sum(scores) / len(scores) if scores else 100.0
    return {
        "avg_integrity": round(avg, 1),
        "total_users": len(scores), # Total sessions
        "risk_distribution": risk_dist
    }
