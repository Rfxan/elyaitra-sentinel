import time
import uuid
import logging

logger = logging.getLogger(__name__)

# Config
INCIDENT_TIMEOUT_SEC = 120
MAX_RESOLVED_INCIDENTS = 100

# Storage
_active_incidents = {}  # keyed by ip
_resolved_incidents = []

def _compute_severity(incident: dict) -> str:
    """
    Calculates severity:
    - critical: poisoning OR blocked IP OR multiple evasions/attacks
    - high: evasion > 0 or attack > 2
    - medium: attack > 0
    - low: otherwise
    """
    if incident["poisoning_count"] > 0 or incident["status"] == "blocked":
        return "critical"
    
    if incident["evasion_count"] > 2:
        return "critical"
        
    if incident["evasion_count"] > 0:
        return "high"
        
    if incident["attack_count"] > 2:
        return "high"
        
    if incident["attack_count"] > 0:
        return "medium"
        
    return "low"

def _compute_pattern(incident: dict) -> str:
    """
    Determine pattern string: escalating, persistent, sporadic
    """
    if incident["evasion_count"] > 0 and incident["attack_count"] > 0:
        return "escalating"
    
    if (incident["attack_count"] + incident["evasion_count"] + incident["poisoning_count"]) > 5:
        return "persistent"
        
    return "sporadic"

def _cleanup_inactive():
    """
    Moves inactive incidents to _resolved_incidents
    """
    current_time = time.time()
    to_resolve = []
    
    for ip, inc in _active_incidents.items():
        if current_time - inc["last_seen_time"] > INCIDENT_TIMEOUT_SEC:
            if inc["status"] != "blocked":
                inc["status"] = "resolved"
            to_resolve.append(ip)
            
    for ip in to_resolve:
        inc = _active_incidents.pop(ip)
        _resolved_incidents.insert(0, inc)
        
    # Maintain max size
    while len(_resolved_incidents) > MAX_RESOLVED_INCIDENTS:
        _resolved_incidents.pop()

def update(event: dict):
    _cleanup_inactive()
    ip = event.get("ip")
    if not ip:
        return
        
    current_time = time.time()
    
    # Get or create incident
    if ip not in _active_incidents:
        _active_incidents[ip] = {
            "incident_id": f"INC-{uuid.uuid4().hex[:8].upper()}",
            "ip": ip,
            "start_time": event.get("timestamp", time.strftime("%Y-%m-%d %H:%M:%S")),
            "last_seen": event.get("timestamp", time.strftime("%Y-%m-%d %H:%M:%S")),
            "last_seen_time": current_time,
            "event_count": 0,
            "attack_count": 0,
            "evasion_count": 0,
            "poisoning_count": 0,
            "status": "active",
            "severity": "low",
            "pattern": "sporadic"
        }
    
    inc = _active_incidents[ip]
    
    # Update counters
    inc["event_count"] += 1
    inc["last_seen"] = event.get("timestamp", time.strftime("%Y-%m-%d %H:%M:%S"))
    inc["last_seen_time"] = current_time
    
    etype = event.get("type", "").lower()
    if etype == "attack":
        inc["attack_count"] += 1
    elif etype == "evasion":
        inc["evasion_count"] += 1
    elif etype == "poison":
        inc["poisoning_count"] += 1
        
    if event.get("status") == "blocked":
        inc["status"] = "blocked"
        
    # Re-evaluate
    inc["severity"] = _compute_severity(inc)
    inc["pattern"] = _compute_pattern(inc)
    
    # Enrichment
    event["incident_id"] = inc["incident_id"]
    event["severity"] = inc["severity"]

def get_active_incidents():
    _cleanup_inactive()
    return list(_active_incidents.values())
    
def get_resolved_incidents():
    return list(_resolved_incidents)
    
def get_incident(incident_id: str):
    _cleanup_inactive()
    for inc in _active_incidents.values():
        if inc["incident_id"] == incident_id:
            return inc
    for inc in _resolved_incidents:
        if inc["incident_id"] == incident_id:
            return inc
    return None

def get_summary():
    _cleanup_inactive()
    active = list(_active_incidents.values())
    all_incidents = active + _resolved_incidents
    
    critical = sum(1 for i in all_incidents if i["severity"] == "critical")
    
    # Calculate top IPs by event count across all incidents
    ip_counts = {}
    for i in all_incidents:
        ip_counts[i["ip"]] = ip_counts.get(i["ip"], 0) + i["event_count"]
        
    top_ips = sorted([{"ip": ip, "events": count} for ip, count in ip_counts.items()], key=lambda x: x["events"], reverse=True)[:5]
    
    return {
        "total_incidents": len(all_incidents),
        "active": len(active),
        "critical": critical,
        "top_ips": [ip["ip"] for ip in top_ips]
    }

def reset():
    _active_incidents.clear()
    _resolved_incidents.clear()
