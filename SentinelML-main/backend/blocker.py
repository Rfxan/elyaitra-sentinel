import time
from threading import Lock

class Blocker:
    def __init__(self, strike_threshold=3, on_block_cb=None):
        self.strike_threshold = strike_threshold
        self.strikes = {} # {ip: [ {type, timestamp} ]}
        self.blocked_ips = {} # {ip: {timestamp, reason, strike_count, details}}
        self.on_block_cb = on_block_cb
        self.lock = Lock()

    def record_strike(self, ip, is_adversarial=False, attack_type="attack", reason="Adversarial behavior"):
        with self.lock:
            if ip in self.blocked_ips:
                return True
            
            if is_adversarial:
                if ip not in self.strikes:
                    self.strikes[ip] = []
                
                self.strikes[ip].append({
                    "type": attack_type,
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                })
                
                strike_count = len(self.strikes[ip])
                
                # AUTOMATIC BLOCKING ENABLED (Honeypot Mode - No 403)
                if strike_count >= self.strike_threshold:
                    # Build detailed reason
                    counts = {}
                    for s in self.strikes[ip]:
                        t = s["type"]
                        counts[t] = counts.get(t, 0) + 1
                    
                    reason_parts = [f"{t} x{c}" for t, c in counts.items()]
                    detailed_reason = f"{self.strike_threshold}-strike policy: " + " + ".join(reason_parts)
                    
                    self.blocked_ips[ip] = {
                        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                        "reason": detailed_reason,
                        "strike_count": strike_count,
                        "details": self.strikes[ip]
                    }
                    
                    if self.on_block_cb:
                        self.on_block_cb(ip, attack_type)
                        
                    return True
            return False

    def is_blocked(self, ip):
        with self.lock:
            return ip in self.blocked_ips

    def get_blocked_ips(self):
        with self.lock:
            return self.blocked_ips.copy()

    def unblock_ip(self, ip):
        with self.lock:
            if ip in self.blocked_ips:
                del self.blocked_ips[ip]
                if ip in self.strikes:
                    self.strikes[ip] = []
                return True
            return False

    def unblock_all(self):
        with self.lock:
            self.blocked_ips.clear()
            self.strikes.clear()
            return True

    def block_ip_manually(self, ip, reason="Manual block"):
        with self.lock:
            self.blocked_ips[ip] = {
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "reason": reason,
                "strike_count": len(self.strikes.get(ip, []))
            }
            if self.on_block_cb:
                self.on_block_cb(ip, "manual_intervention")
