import time
import numpy as np
from collections import defaultdict, deque
from scipy.stats import entropy as scipy_entropy

class ExtractionDetector:
    def __init__(self, risk_threshold=60):
        self.risk_threshold = risk_threshold
        self.ip_queries = defaultdict(list)      # ip -> list of {ts, features, label}
        self.ip_risk = defaultdict(float)        # ip -> current risk score
        self.honeypot_ips = set()                # IPs currently in honeypot mode
        self.total_extraction_attempts = 0
        self.honeypot_activations = 0
        self.events = deque(maxlen=200)
        self.global_enabled = True

    def record_query(self, ip: str, features: list, pred_label: int, confidence: float):
        now = time.time()
        self.ip_queries[ip].append({
            "ts": now,
            "features": features,
            "label": pred_label,
            "confidence": confidence
        })
        # Keep only last 5 minutes
        cutoff = now - 300
        self.ip_queries[ip] = [q for q in self.ip_queries[ip] if q["ts"] > cutoff]
        
        risk = self._compute_risk(ip)
        self.ip_risk[ip] = risk
        
        if risk > self.risk_threshold:
            self.total_extraction_attempts += 1
            if ip not in self.honeypot_ips:
                self.honeypot_ips.add(ip)
                self.honeypot_activations += 1
                self.events.appendleft({
                    "type": "honeypot_activated",
                    "ip": ip,
                    "risk": risk,
                    "ts": time.strftime("%H:%M:%S")
                })
        elif risk > 30:
            self.total_extraction_attempts += 1
            self.events.appendleft({
                "type": "extraction_probe",
                "ip": ip,
                "risk": risk,
                "ts": time.strftime("%H:%M:%S")
            })

    def get_ip_risk(self, ip: str) -> float:
        """Returns the current risk score for a given IP."""
        return self.ip_risk.get(ip, 0.0)

    def _compute_risk(self, ip: str) -> float:
        queries = self.ip_queries[ip]
        if len(queries) < 2:
            return 0.0
        
        # Signal 1: Query volume (many queries = high risk)
        volume_score = min(40, len(queries) * 1.5)
        
        # Signal 2: Feature-space entropy (systematic coverage = high entropy)
        features_matrix = np.array([q["features"] for q in queries])
        col_entropies = []
        for col in features_matrix.T:
            # Check if column is constant (0 entropy)
            if np.all(col == col[0]):
                col_entropies.append(0.0)
                continue
            
            # Robust histogram calculation
            hist, _ = np.histogram(col, bins=min(10, len(col)))
            hist = hist + 1e-9
            col_entropies.append(scipy_entropy(hist / hist.sum()))
            
        avg_entropy = float(np.mean(col_entropies)) if col_entropies else 0.0
        entropy_score = min(40, avg_entropy * 20)  # Increase multiplier for visibility
        
        # Signal 3: Boundary probing (queries near decision boundary = confidence ~0.5)
        confidences = [q["confidence"] for q in queries]
        near_boundary = sum(1 for c in confidences if 0.4 < c < 0.6)
        boundary_score = min(30, near_boundary * 8) # Weight boundary probing more heavily
        
        total_risk = volume_score + entropy_score + boundary_score
        return round(min(100, total_risk), 2)

    def generate_poisoned_response(self, pred_label: int, confidence: float):
        # Flip the label and fake high confidence to corrupt surrogate model
        flipped_label = 0 if pred_label != 0 else 1
        fake_confidence = round(0.85 + np.random.uniform(0, 0.1), 3)
        return flipped_label, fake_confidence

    def is_honeypot(self, ip: str) -> bool:
        return self.global_enabled and ip in self.honeypot_ips

    def get_status(self) -> dict:
        active_threats = []
        for ip, risk in sorted(self.ip_risk.items(), key=lambda x: -x[1]):
            if risk > 20:
                active_threats.append({
                    "ip": ip,
                    "risk": risk,
                    "query_count": len(self.ip_queries[ip]),
                    "is_honeypot": ip in self.honeypot_ips
                })
        return {
            "active_threats": active_threats[:10],
            "total_extraction_attempts": self.total_extraction_attempts,
            "honeypot_activations": self.honeypot_activations,
            "honeypot_ips": list(self.honeypot_ips),
            "global_enabled": self.global_enabled,
            "recent_events": list(self.events)[:20]
        }

    def reset(self):
        self.ip_queries.clear()
        self.ip_risk.clear()
        self.honeypot_ips.clear()
        self.total_extraction_attempts = 0
        self.honeypot_activations = 0
        self.events.clear()
