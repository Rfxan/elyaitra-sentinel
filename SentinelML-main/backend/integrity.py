import hashlib
import json
import time
import os

AUDIT_FILE = os.path.join(os.path.dirname(__file__), "data", "audit.jsonl")

_prev_hash = ""
_model_hash = ""

def compute_model_hash(path: str) -> str:
    if not os.path.exists(path):
        return ""
    with open(path, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()

def store_model_hash(path: str):
    global _model_hash
    _model_hash = compute_model_hash(path)

def verify_model_hash(path: str) -> bool:
    if not _model_hash:
        return True  # Not yet stored
    return compute_model_hash(path) == _model_hash

def log_event(event_dict: dict):
    global _prev_hash
    entry = {**event_dict, "ts": time.time(), "prev_hash": _prev_hash}
    entry_str = json.dumps(entry, sort_keys=True)
    entry["hash"] = hashlib.sha256(entry_str.encode()).hexdigest()
    _prev_hash = entry["hash"]
    os.makedirs(os.path.dirname(AUDIT_FILE), exist_ok=True)
    with open(AUDIT_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")

def get_audit_log(n: int = 50) -> list:
    if not os.path.exists(AUDIT_FILE):
        return []
    with open(AUDIT_FILE, "r") as f:
        lines = f.readlines()
    entries = []
    for line in lines[-n:]:
        try:
            entries.append(json.loads(line))
        except Exception:
            pass
    return list(reversed(entries))

def verify_chain() -> bool:
    if not os.path.exists(AUDIT_FILE):
        return True
    entries = get_audit_log(n=10000)
    entries = list(reversed(entries))
    prev = ""
    for entry in entries:
        stored_hash = entry.get("hash", "")
        check = {k: v for k, v in entry.items() if k != "hash"}
        check["prev_hash"] = prev
        computed = hashlib.sha256(json.dumps(check, sort_keys=True).encode()).hexdigest()
        if computed != stored_hash:
            return False
        prev = stored_hash
    return True
