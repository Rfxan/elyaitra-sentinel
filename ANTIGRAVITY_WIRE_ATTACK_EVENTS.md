# ANTIGRAVITY BUILD PROMPT
## Wire Elyaitra Attack Events into SentinelML's traffic_feed

---

## WHAT THIS DOES

When `rag_attacker.py` sends attack queries to Elyaitra's `/ai` router (or any `/query` endpoint), those events must appear **live** in the SentinelML dashboard — in the traffic feed, attacker profiles, honeypot log, and blocked IPs — exactly as if the attack hit SentinelML's own `/predict` endpoint.

The gap identified from code analysis: Elyaitra's `security_logging_middleware` already captures every request and passes it to `send_log` in `app.security.logger`. But `send_log` does not currently forward to SentinelML. That is the only wire that needs to be connected.

**Nothing in the SentinelML frontend changes. Nothing in `useTrafficPolling.js` changes.** The frontend already polls `/traffic-feed`, `/attacker-profiles`, and `/honeypot-log` every 3 seconds — it will display attack events automatically once they reach SentinelML's `traffic_feed` deque.

---

## READ THESE FILES BEFORE WRITING ANYTHING

```
C:\Users\RYAN\Documents\elyaitra\backend\app\security\logger.py
C:\Users\RYAN\Documents\elyaitra\backend\main.py
C:\Users\RYAN\Documents\SentinelML-main\backend\main.py
C:\Users\RYAN\Documents\SentinelML-main\backend\defender.py
C:\Users\RYAN\Documents\SentinelML-main\backend\blocker.py
```

Specifically in `SentinelML-main/backend/main.py`, find and note:
- The exact shape of the `event` dict that gets `appendleft`-ed into `traffic_feed`
- The exact field names: `ip`, `timestamp`, `type`, `confidence`, `mitre_tags`, `blocked`, `source`, `country`, `lat`, `lon` — whatever is actually there
- The `POST /predict` handler — this is the reference implementation you will mirror

---

## THE ARCHITECTURE

```
rag_attacker.py
      │
      │  HTTP POST  (injection queries, flood, recon)
      ▼
Elyaitra backend  (port 8001)
  /ai router  →  security_logging_middleware  →  send_log()
                                                      │
                                                      │  ← YOU ARE WIRING THIS
                                                      ▼
                                             SentinelML backend  (port 8000)
                                               traffic_feed deque
                                               blocker.record_strike()
                                               defender.detect_evasion()
                                                      │
                                                      │  polled every 3s
                                                      ▼
                                             SentinelML dashboard
                                          (TrafficFeed, AttackerProfiles,
                                           HoneypotMonitor, BlockList)
```

---

## CHANGE 1 — `elyaitra/backend/app/security/logger.py`

This is the only file that needs significant new logic. Read it first to understand its current structure, then apply these changes.

### 1A. Add the SentinelML forwarding function

Add this function to the module. Place it after any existing imports and before `send_log`:

```python
import httpx
import asyncio
import re
from datetime import datetime, timezone

SENTINEL_URL = "http://localhost:8000"

# ── Attack classification heuristics ─────────────────────────────────────────
# These mirror what rag_attacker.py sends so the classification is accurate.

RAG_INJECTION_PATTERNS = [
    r"ignore (all |previous )?instructions",
    r"print (your |the )?system prompt",
    r"list all documents",
    r"dump (your |the )?(knowledge|database|db|vector)",
    r"repeat everything",
    r"act as (dan|developer|admin|root)",
    r"bypass",
    r"jailbreak",
    r"forget (your |all )?instructions",
    r"output (all|every|raw) (chunks?|documents?|data|entries)",
    r"chromadb",
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
    """
    Classify an Elyaitra HTTP request as a specific attack type.
    Returns a dict with 'type', 'severity', 'mitre_tags', 'confidence'.
    """
    body_lower = (body or "").lower()
    path_lower = (path or "").lower()

    # Prompt injection — highest severity
    for pattern in RAG_INJECTION_PATTERNS:
        if re.search(pattern, body_lower):
            return {
                "type": "RAG_INJECTION",
                "severity": "HIGH",
                "mitre_tags": ["T1190", "T1059", "T1530"],
                "confidence": 0.95,
                "description": f"Prompt injection attempt detected: '{body[:80]}'"
            }

    # Recon — medium severity
    for pattern in RAG_RECON_PATTERNS:
        if re.search(pattern, body_lower):
            return {
                "type": "RAG_RECON",
                "severity": "MEDIUM",
                "mitre_tags": ["T1190", "T1213"],
                "confidence": 0.78,
                "description": f"RAG enumeration/recon query: '{body[:80]}'"
            }

    # Any POST to AI endpoints is suspicious if body is large or repetitive
    if method == "POST" and any(seg in path_lower for seg in ["/ai", "/query", "/ask", "/chat", "/answer"]):
        return {
            "type": "RAG_PROBE",
            "severity": "LOW",
            "mitre_tags": ["T1190"],
            "confidence": 0.55,
            "description": f"AI endpoint probe: {method} {path}"
        }

    # Normal traffic
    return {
        "type": "NORMAL",
        "severity": "LOW",
        "mitre_tags": [],
        "confidence": 0.10,
        "description": f"Normal request: {method} {path}"
    }


async def forward_to_sentinel(ip: str, method: str, path: str, body: str) -> None:
    """
    Classify the Elyaitra request and push it into SentinelML's traffic_feed
    by calling POST /predict with a translated feature payload.
    Fires-and-forgets — never blocks the Elyaitra response path.
    """
    classification = classify_elyaitra_request(method, path, body)

    # Only forward events that are not boring normal traffic,
    # OR forward everything if you want full visibility (change condition to True)
    if classification["type"] == "NORMAL":
        return

    # Build the SentinelML event payload.
    # SentinelML's /predict endpoint expects network features + metadata.
    # We inject Elyaitra-specific context into the 'source' and 'extra' fields.
    payload = {
        "ip": ip,
        "source": "elyaitra",                          # tells SentinelML this came from Elyaitra
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
                f"{SENTINEL_URL}/ingest-event",   # new endpoint — see Change 2
                json=payload,
            )
    except Exception:
        pass   # never let SentinelML forwarding crash Elyaitra
```

### 1B. Call `forward_to_sentinel` from `send_log`

Read the existing `send_log` function. It receives request metadata — IP, method, path, body. Find where it currently processes the log entry, then add the forwarding call.

**Find** the `send_log` function (it may be `async def send_log(...)` or `def send_log(...)`).

**Add** this line inside it, after the existing logging logic, before any `return`:

```python
# Forward to SentinelML — fire and forget, never awaited inline
asyncio.create_task(forward_to_sentinel(
    ip=ip,           # use whatever variable name holds the client IP in send_log
    method=method,   # use whatever variable name holds the HTTP method
    path=path,       # use whatever variable name holds the request path
    body=body,       # use whatever variable name holds the request body string
))
```

**If `send_log` is synchronous** (not `async def`), use this instead:

```python
loop = asyncio.get_event_loop()
if loop.is_running():
    loop.create_task(forward_to_sentinel(ip=ip, method=method, path=path, body=body))
```

**Match the variable names to what actually exists in `send_log`.** Do not invent variable names — read the function signature and use whatever it actually receives.

---

## CHANGE 2 — `SentinelML-main/backend/main.py`

Add one new endpoint: `POST /ingest-event`. This receives Elyaitra's forwarded event and pushes it directly into `traffic_feed` using the exact same dict shape that `/predict` uses.

Read the `/predict` endpoint handler carefully. Find the exact keys in the `event` dict it builds and `appendleft`s into `traffic_feed`. Your new endpoint must produce an event dict with the **same keys** so the frontend renders it correctly.

Add this endpoint to `main.py` (place it near the other data ingestion endpoints):

```python
from pydantic import BaseModel
from typing import Optional, List

class ElyaitraEventPayload(BaseModel):
    ip: str
    source: str = "elyaitra"
    type: str
    severity: str = "MEDIUM"
    confidence: float = 0.8
    mitre_tags: List[str] = []
    description: str = ""
    timestamp: str = ""
    path: str = ""
    method: str = ""
    app: str = "Elyaitra RAG"

@app.post("/ingest-event")
async def ingest_event(payload: ElyaitraEventPayload):
    """
    Receives attack events from Elyaitra backend and pushes them into
    SentinelML's traffic_feed so the dashboard displays them live.
    """
    # Build the event dict using the EXACT same field names as /predict uses.
    # Read /predict's event dict and mirror it here — adjust field names to match.
    event = {
        "ip": payload.ip,
        "timestamp": payload.timestamp or datetime.now(timezone.utc).isoformat(),
        "type": payload.type,                  # "RAG_INJECTION", "RAG_RECON", "RAG_PROBE"
        "severity": payload.severity,
        "confidence": payload.confidence,
        "mitre_tags": payload.mitre_tags,
        "description": payload.description,
        "source": payload.source,              # "elyaitra" — visible in dashboard
        "app": payload.app,                    # "Elyaitra RAG"
        "blocked": False,                      # will be updated below if IP gets blocked
        # Geographic fields — SentinelML's /predict populates these via geoip.
        # Use the same geoip lookup that /predict uses, or default to unknowns:
        "country": "Unknown",
        "lat": 0.0,
        "lon": 0.0,
    }

    # IMPORTANT: Read how /predict calls geoip and copy that call here.
    # If SentinelML has a get_geo(ip) or geoip_lookup(ip) function, call it:
    # geo = get_geo(payload.ip)
    # event["country"] = geo.get("country", "Unknown")
    # event["lat"] = geo.get("lat", 0.0)
    # event["lon"] = geo.get("lon", 0.0)

    # Apply the 3-strike blocker for attack-type events
    attack_types = {"RAG_INJECTION", "RAG_RECON", "RAG_PROBE"}
    if payload.type in attack_types:
        blocker.record_strike(payload.ip)
        if blocker.is_blocked(payload.ip):
            event["blocked"] = True

    # Push into the shared traffic_feed deque — frontend polls this every 3s
    traffic_feed.appendleft(event)

    # Also push into the SIEM log if SentinelML maintains one
    # (read /predict to see if it also appends to siem_log — if yes, do it here too)
    # siem_log.appendleft(event)

    return {"status": "ingested", "type": payload.type, "ip": payload.ip}
```

### Critical: match the event dict shape exactly

After writing the above, open the `/predict` endpoint and compare your `event` dict field-by-field against the one `/predict` builds. Any field that `/predict` sets that yours doesn't will cause the frontend components to render blank or crash for Elyaitra events.

Common fields to check: `id`, `packet_id`, `label`, `prediction`, `attack_label`, `evasion`, `poison` — add any that `/predict` includes.

### Also add CORS for Elyaitra backend origin

Find the `CORSMiddleware` block in `SentinelML-main/backend/main.py`. Add Elyaitra's backend origin if not already present:

```python
allow_origins=[
    "http://localhost:8001",   # Elyaitra backend calling /ingest-event
    "http://localhost:8080",   # Elyaitra frontend
    "http://localhost:5173",
    # ... keep existing origins
],
```

---

## CHANGE 3 — `elyaitra/backend/main.py`

Add `httpx` to Elyaitra's requirements if not already there:

```
httpx>=0.27.0
```

Run `pip install httpx` in the Elyaitra backend venv if needed.

No other changes to Elyaitra's `main.py` are needed — `security_logging_middleware` already fires on every request.

---

## VERIFICATION CHECKLIST

After applying all changes, test in this order:

**Step 1 — Confirm `/ingest-event` exists:**
```bash
curl -X POST http://localhost:8000/ingest-event \
  -H "Content-Type: application/json" \
  -d '{"ip":"1.2.3.4","type":"RAG_INJECTION","severity":"HIGH","confidence":0.95,"mitre_tags":["T1190"],"description":"test injection","path":"/ai/query","method":"POST","app":"Elyaitra RAG"}'
```
Expected response: `{"status": "ingested", "type": "RAG_INJECTION", "ip": "1.2.3.4"}`

**Step 2 — Confirm it appears in traffic-feed:**
```bash
curl http://localhost:8000/traffic-feed
```
The first item in the array should be the event you just posted with `"source": "elyaitra"`.

**Step 3 — Open the SentinelML dashboard** at `localhost:8080/sentinel`. It should show the test injection event in the traffic feed panel within 3 seconds (the polling interval).

**Step 4 — Run the attacker:**
```bash
python rag_attacker.py --mode inject
```
Watch the SentinelML dashboard — each injection payload sent to Elyaitra should appear as a `RAG_INJECTION` event in the traffic feed in real time.

**Step 5 — Run blitz mode:**
```bash
python rag_attacker.py --mode blitz --count 30
```
After enough strikes, the attacker IP should appear in the Block List panel on the dashboard.

---

## WHAT NOT TO DO

- Do NOT modify `useTrafficPolling.js` — it already polls `/traffic-feed` and will pick up Elyaitra events automatically
- Do NOT modify any SentinelML frontend components
- Do NOT change how `/predict` works — `/ingest-event` is additive, not a replacement
- Do NOT let the `forward_to_sentinel` call block or raise exceptions in Elyaitra's request path — it must always be fire-and-forget with a try/except wrapper
- Do NOT forward `NORMAL` traffic to SentinelML unless you want every Elyaitra page load to appear in the dashboard (the classification function filters these out by default)
