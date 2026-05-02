import random
import time
from typing import Dict

class ReputationEngine:
    def __init__(self):
        # Local cache to avoid repeated "API" calls
        # {ip: {"score": int, "timestamp": float}}
        self.cache: Dict[str, dict] = {}
        self.cache_ttl = 3600  # 1 hour
        
        # High-risk IPs for demonstration (Mock Data)
        self.BAD_IPS_SAMPLES = [
            "45.12.23.8",   # Europe
            "77.88.55.2",   # Russia
        ]

    def get_score(self, ip: str) -> int:
        """
        Returns a reputation score from 0 (Safe) to 100 (Extremely Malicious).
        In a real scenario, this would hit AbuseIPDB or IPVoid.
        """
        current_time = time.time()
        
        # Check cache
        if ip in self.cache:
            entry = self.cache[ip]
            if current_time - entry["timestamp"] < self.cache_ttl:
                return entry["score"]

        # Simulate API Latency (50-200ms)
        time.sleep(random.uniform(0.05, 0.2))

        # Mock Logic:
        # 1. Known bad IPs from our list get high scores (85-100)
        # 2. Others get a low background risk (0-30)
        # 3. Random spikes for "new" threats (for demo purposes)
        
        if ip in self.BAD_IPS_SAMPLES:
            score = random.randint(85, 100)
        elif random.random() < 0.1:  # 10% chance of a random suspicious score
            score = random.randint(40, 75)
        else:
            score = random.randint(0, 15)

        # Update cache
        self.cache[ip] = {"score": score, "timestamp": current_time}
        return score

    def get_risk_label(self, score: int) -> str:
        if score < 20: return "Clean"
        if score < 50: return "Low Risk"
        if score < 80: return "Suspicious"
        return "Malicious"

# Global instance
_engine = ReputationEngine()

def check_ip(ip: str) -> dict:
    score = _engine.get_score(ip)
    label = _engine.get_risk_label(score)
    return {
        "score": score,
        "label": label,
        "is_high_risk": score >= 85
    }
