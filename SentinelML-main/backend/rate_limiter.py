from collections import defaultdict, deque
import time

class TrainRateLimiter:
    def __init__(self, window_seconds=60, max_calls=10):
        self.window_seconds = window_seconds
        self.max_calls = max_calls
        self.calls = defaultdict(deque)

    def check_and_record(self, ip: str) -> tuple:
        now = time.time()
        # Prune old timestamps
        while self.calls[ip] and self.calls[ip][0] < now - self.window_seconds:
            self.calls[ip].popleft()
            
        count = len(self.calls[ip])
        if count >= self.max_calls:
            reset_in = round(self.window_seconds - (now - self.calls[ip][0]), 1)
            return (False, count, reset_in)
            
        self.calls[ip].append(now)
        return (True, count + 1, 0.0)

    def reset(self, ip: str):
        self.calls[ip].clear()

    def reset_all(self):
        self.calls.clear()

    def get_status(self) -> dict:
        return {
            ip: {
                "count": len(dq),
                "max_calls": self.max_calls,
                "window_seconds": self.window_seconds
            }
            for ip, dq in self.calls.items() if len(dq) > 0
        }
