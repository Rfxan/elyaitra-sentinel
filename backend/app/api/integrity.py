from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer
from typing import List

from app.db.database import get_db
from app.models.user_request import UserRequest

router = APIRouter(prefix="/integrity", tags=["Integrity Scoring"])

@router.get("/score/{user_id}")
def get_user_integrity_score(user_id: int, db: Session = Depends(get_db)):
    total_count = db.query(UserRequest).filter(UserRequest.user_id == user_id).count()
    if total_count == 0:
        return {"user_id": user_id, "score": 100.0, "status": "CLEAN", "total_queries": 0}
        
    malicious_count = db.query(UserRequest).filter(UserRequest.user_id == user_id, UserRequest.is_malicious == True).count()
    
    score = 100.0 - (malicious_count / total_count * 100.0)
    score = max(0.0, round(score, 2))
    
    status = "CLEAN"
    if score < 80: status = "SUSPICIOUS"
    if score < 50: status = "HIGH_RISK"
    if score < 20: status = "CRITICAL_RISK"
    
    return {
        "user_id": user_id,
        "score": score,
        "status": status,
        "total_queries": total_count,
        "malicious_queries": malicious_count
    }

@router.get("/leaderboard")
def get_integrity_leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    results = db.query(
        UserRequest.user_id,
        func.count(UserRequest.id).label("total"),
        func.sum(func.cast(UserRequest.is_malicious, Integer)).label("malicious")
    ).group_by(UserRequest.user_id).all()
    
    leaderboard = []
    for r in results:
        if r.user_id is None: continue
        total = r.total
        malicious = r.malicious or 0
        score = 100.0 - (malicious / total * 100.0)
        leaderboard.append({
            "user_id": r.user_id,
            "total_queries": total,
            "bypass_attempts": malicious,
            "integrity_score": round(score, 2)
        })
        
    leaderboard.sort(key=lambda x: x["integrity_score"], reverse=True)
    return leaderboard[:limit]


@router.get("/stats")
def get_integrity_stats(db: Session = Depends(get_db)):
    """Fleet-wide integrity statistics for the dashboard."""
    results = db.query(
        UserRequest.user_id,
        func.count(UserRequest.id).label("total"),
        func.sum(func.cast(UserRequest.is_malicious, Integer)).label("malicious")
    ).group_by(UserRequest.user_id).all()
    
    if not results:
        return {"avg_integrity": 100.0, "total_users": 0, "risk_distribution": {"clean": 0, "suspicious": 0, "critical": 0}}
    
    scores = []
    risk_dist = {"clean": 0, "suspicious": 0, "critical": 0}
    for r in results:
        if r.user_id is None: continue
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
        "total_users": len(scores),
        "risk_distribution": risk_dist
    }
