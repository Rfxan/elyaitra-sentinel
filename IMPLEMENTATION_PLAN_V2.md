# Elyaitra Sentinel — Implementation Plan V2

## Audit Findings Table

| File | Status | Finding |
|------|--------|---------|
| `backend/app/main.py` | EXISTS_COMPLETE | 12 routers registered (health,auth,payments,access,content,ai,admin,flashcards,forensics,redteam,integrity,rooms). CORS middleware, security_logging_middleware with honeypot check. Startup calls init_db(). No demo router. |
| `backend/app/api/health.py` | EXISTS_PARTIAL | GET /health — checks DB, ChromaDB, LLM (env var only), SentinelML (hardcoded "online"). No /health/full. No latency or uptime. |
| `backend/app/api/auth.py` | EXISTS_COMPLETE | Inline verify_password() + hash_password() using bcrypt+sha256. POST /auth/signup, POST /auth/login. No create_access_token(). |
| `backend/app/api/integrity.py` | EXISTS_COMPLETE | GET /integrity/score/{user_id}, GET /integrity/leaderboard, GET /integrity/stats |
| `backend/app/routers/forensics.py` | EXISTS_PARTIAL | GET /events, GET /events/{session_id}, GET /replay/{session_id}, POST /export, POST /export/stix. **Hardcodes GeminiClient** (line 9,36). Missing: /analyze, /export/pdf/{session_id}. |
| `backend/app/routers/redteam.py` | EXISTS_PARTIAL | GET /challenges (line 54), GET /attack-types, POST /start, POST /submit, GET /status/{session_id}. **Hardcodes GeminiClient** (line 12,95). |
| `backend/app/routers/rooms.py` | EXISTS_COMPLETE | POST /create, POST /join, GET /{id}/messages, POST /{id}/messages, GET /list |
| `backend/app/routers/demo.py` | MISSING | Does not exist |
| `backend/app/api/settings.py` | MISSING | Does not exist |
| `backend/app/db/models.py` | EXISTS_EMPTY | 0 bytes, no content |
| `backend/app/db/database.py` | EXISTS_COMPLETE | SQLite engine, SessionLocal, Base = declarative_base(), get_db() generator |
| `backend/app/db/init_db.py` | EXISTS_COMPLETE | Imports User, Payment, Flashcard, Flowchart, AttackEvent, RedTeamSession, UserRequest, Room, RoomMessage from app.models.*. Calls Base.metadata.create_all(). |
| `backend/app/models/attack_event.py` | EXISTS_COMPLETE | id, timestamp, ip, attack_type, mitre_technique, raw_query, honeypot_served, response_snippet, session_id |
| `backend/app/models/redteam.py` | EXISTS_COMPLETE | id, session_id, start_time, end_time, score, challenges_completed(JSON), total_challenges, status |
| `backend/app/models/room.py` | EXISTS_COMPLETE | Room(id,name,syllabus_id,created_by,shared_token,created_at), RoomMessage(id,room_id,user_id,role,content,timestamp) |
| `backend/app/models/user.py` | EXISTS_COMPLETE | id, full_name, email, password_hash, created_at |
| `backend/app/core/config.py` | EXISTS_EMPTY | 0 bytes |
| `backend/app/core/security.py` | EXISTS_EMPTY | 0 bytes |
| `backend/app/services/payment_service.py` | EXISTS_EMPTY | 0 bytes |
| `backend/app/services/user_service.py` | EXISTS_EMPTY | 0 bytes |
| `backend/app/security/logger.py` | EXISTS_COMPLETE | get_honeypot_response() at line 210. Checks /blocked-ips, calls generate_honeypot_response(). Also: classify_elyaitra_request(), forward_to_sentinel(), send_log(). |
| `backend/app/honeypot_generator.py` | EXISTS_PARTIAL | **Imports GeminiClient** (line 3). Uses client = GeminiClient() on line 23. |
| `backend/app/utils/stix_exporter.py` | EXISTS_COMPLETE | Full STIX 2.1 Bundle generation |
| `backend/app/utils/pdf_exporter.py` | MISSING | Does not exist |
| `backend/app/utils/dependencies.py` | EXISTS_EMPTY | 0 bytes |
| `backend/requirements.txt` | EXISTS_PARTIAL | Has: bcrypt, pydantic-settings, python-jose, slowapi, stix2. **Missing: reportlab** |
| `SentinelML-main/backend/main.py` | EXISTS_COMPLETE | 35+ endpoints. attacker_profiles dict at line 77. send_telegram_alert() at line 40 (called in /predict but NOT in /ingest-event). No WebSocket. No /config/telegram. /attacker-profiles at line 670 (no risk_score). |
| `SentinelML model_metadata/feature_importances.json` | EXISTS_COMPLETE | Present |
| `frontend/vite.config.ts` | EXISTS_PARTIAL | Proxies: /api/v1→:8001, /sentinel-api→:8003. **Missing /ws proxy**. |
| `frontend/tsconfig.app.json` | EXISTS_COMPLETE | @/ alias configured: `"@/*": ["./src/*"]` |
| `frontend/package.json` | EXISTS_PARTIAL | Has: framer-motion ^12.38.0, axios ^1.6.2, recharts ^2.15.4, lucide-react ^0.462.0. **Missing: d3, uuid**. |
| `frontend/src/lib/api.ts` | EXISTS_PARTIAL | Uses fetch (not axios). No X-Session-ID interceptor. |
| `frontend/src/sentinel-app/App.jsx` | EXISTS_PARTIAL | 16 nav routes (flat). Missing: Attack Graph route. |
| `frontend/src/sentinel-app/components/` | EXISTS_PARTIAL | 57 files. **Missing: ThreatNarrativeDrawer, AttackGraph, AttackerProfileCard**. |
| `frontend/src/sentinel-app/hooks/` | EXISTS_PARTIAL | 6 hooks. **Missing: useWebSocketFeed.js**. |
| `frontend/src/sentinel-app/components/Topbar.jsx` | EXISTS_PARTIAL | Logo uses `<img src="/logo.png">`. No "Seed Demo Data" button. |
| `frontend/src/sentinel-app/components/Sidebar.jsx` | EXISTS_PARTIAL | FLAT 14-item list. Not grouped into sections. |
| `frontend/src/sentinel-app/components/StatCard.jsx` | EXISTS_PARTIAL | Trends hardcoded as props ("12","5","2","0.1"). |
| `frontend/src/sentinel-app/components/SystemHealthWidget.jsx` | EXISTS_PARTIAL | Calls `/api/v1/health` (not /health/full). No latency display. |
| `frontend/src/sentinel-app/components/ForensicsView.jsx` | EXISTS_PARTIAL | Has Export STIX. **No Export PDF button**. |
| `frontend/src/sentinel-app/components/TrafficFeed.jsx` | EXISTS_PARTIAL | Uses polling (useTrafficPolling). No WebSocket. |
| `DEMO.md` | MISSING | Does not exist |
| `README.md` | EXISTS_PARTIAL | No feature table, no ASCII architecture diagram |

---

## Already Done (Skip List)

| Item | Evidence |
|------|----------|
| **Fix 6** (get_honeypot_response) | `get_honeypot_response()` found at `security/logger.py` line 210. Checks `/blocked-ips`, calls `generate_honeypot_response()`. main.py calls it at line 134. Fully wired. |
| **Fix 7** (framer-motion) | `"framer-motion": "^12.38.0"` at `package.json` line 51. All motion.* and AnimatePresence usage is valid. |
| **Fix 8** (Vite proxy) | `/api/v1` proxy at vite.config.ts line 12, `/sentinel-api` proxy at line 16. Both correct. |
| **Fix 9** (GlassCard @/ alias) | `@/` alias in vite.config.ts line 26 and tsconfig.app.json line 26. `glass-card.tsx` exists at `src/components/ui/glass-card.tsx`. |
| **Fix 10** (challenges endpoint) | `GET /redteam/challenges` at redteam.py line 54. Returns CHALLENGES list. |

---

## Work Items

### [FIX-1] Provider Factory in honeypot_generator.py
**Status:** Hardcodes `from app.ai_engine.llm_client import GeminiClient` (line 3)
**Gap:** Should use `get_provider()` from factory so OLLAMA_MODE works
**Files to change:** `backend/app/honeypot_generator.py`
**Risk:** LOW — `get_provider()` returns LLMProvider with same `.generate(prompt)` API
**Estimated complexity:** TRIVIAL
**Dependency:** None

### [FIX-2] Provider Factory in forensics.py and redteam.py
**Status:** Both hardcode GeminiClient (forensics.py:9,36 and redteam.py:12,95)
**Gap:** Should use `get_provider()` from factory
**Files to change:** `backend/app/routers/forensics.py`, `backend/app/routers/redteam.py`
**Risk:** LOW
**Estimated complexity:** TRIVIAL
**Dependency:** None

### [FIX-3] DB Models Re-export
**Status:** `db/models.py` is empty. init_db.py imports from app.models.* directly (works).
**Gap:** Any code importing from `app.db.models` will fail. Populate for consistency.
**Files to change:** `backend/app/db/models.py`
**Risk:** LOW
**Estimated complexity:** TRIVIAL
**Dependency:** None

### [FIX-4] core/config.py and core/security.py
**Status:** Both 0 bytes
**Gap:** config.py needs pydantic-settings Settings class. security.py needs verify_password + create_access_token.
**Files to change:** `backend/app/core/config.py`, `backend/app/core/security.py`
**Risk:** LOW — auth.py inline functions untouched
**Estimated complexity:** SMALL
**Dependency:** None

### [FIX-5] Service Stubs
**Status:** Both 0 bytes
**Gap:** Import-time crash if anything references them
**Files to change:** `backend/app/services/payment_service.py`, `backend/app/services/user_service.py`
**Risk:** LOW
**Estimated complexity:** TRIVIAL
**Dependency:** None

### [FEAT-1] WebSocket Live Threat Feed
**Status:** No WebSocket in SentinelML. No useWebSocketFeed.js. No /ws proxy in vite.
**Gap:** Full implementation needed: server endpoint, client hook, proxy config
**Files to change:** `SentinelML-main/backend/main.py`, `frontend/vite.config.ts`, NEW `frontend/src/sentinel-app/hooks/useWebSocketFeed.js`, `frontend/src/sentinel-app/components/TrafficFeed.jsx`
**Risk:** MEDIUM — WebSocket lifecycle management
**Estimated complexity:** MEDIUM
**Dependency:** None

### [FEAT-2] AI Threat Narrative Generator
**Status:** No /forensics/analyze endpoint. No ThreatNarrativeDrawer component.
**Gap:** Backend endpoint + frontend drawer + wiring
**Files to change:** `backend/app/routers/forensics.py`, NEW `frontend/src/sentinel-app/components/ThreatNarrativeDrawer.jsx`, `frontend/src/sentinel-app/components/ForensicsView.jsx`, `frontend/src/sentinel-app/components/TrafficFeed.jsx`
**Risk:** MEDIUM — LLM output parsing
**Estimated complexity:** MEDIUM
**Dependency:** FIX-2 (forensics uses factory)

### [FEAT-3] One-Click Demo Mode
**Status:** No demo.py router. No seed button in Topbar.
**Gap:** Full implementation: router, registration, frontend button
**Files to change:** NEW `backend/app/routers/demo.py`, `backend/app/main.py`, `frontend/src/sentinel-app/components/Topbar.jsx`
**Risk:** LOW
**Estimated complexity:** MEDIUM
**Dependency:** FIX-3 (models available)

### [FEAT-4] PDF Incident Report Export
**Status:** No pdf_exporter.py. reportlab not in requirements.txt. No PDF button in ForensicsView.
**Gap:** Full implementation: utility, endpoint, frontend button, dependency
**Files to change:** NEW `backend/app/utils/pdf_exporter.py`, `backend/app/routers/forensics.py`, `backend/requirements.txt`, `frontend/src/sentinel-app/components/ForensicsView.jsx`
**Risk:** MEDIUM — reportlab API complexity
**Estimated complexity:** MEDIUM
**Dependency:** FIX-2 (forensics router)

### [FEAT-5] Attack Graph Visualization (D3.js)
**Status:** No AttackGraph.jsx. d3 not in package.json. No nav item.
**Gap:** Full implementation: install d3, component, sidebar/app routing
**Files to change:** `frontend/package.json` (npm install d3), NEW `frontend/src/sentinel-app/components/AttackGraph.jsx`, `frontend/src/sentinel-app/components/Sidebar.jsx`, `frontend/src/sentinel-app/App.jsx`
**Risk:** MEDIUM — D3+React integration
**Estimated complexity:** LARGE
**Dependency:** POLISH-1 (sidebar restructure adds Attack Graph nav)

### [FEAT-6] Telegram Notification System
**Status:** send_telegram_alert() exists but not called in /ingest-event. No /config/telegram. No settings.py.
**Gap:** Wire telegram in ingest, add config endpoint, frontend settings panel
**Files to change:** `SentinelML-main/backend/main.py`, NEW `backend/app/api/settings.py`, `backend/app/main.py`, `frontend/src/sentinel-app/components/Topbar.jsx`
**Risk:** LOW
**Estimated complexity:** MEDIUM
**Dependency:** None

### [FEAT-7] Attacker Behavioral Fingerprint Card
**Status:** /attacker-profiles exists but no risk_score. No AttackerProfileCard.jsx. Gauge.jsx exists (PieChart-based, accepts `value` prop 0-100).
**Gap:** Enhance endpoint, create card component, wire into Intelligence page
**Files to change:** `SentinelML-main/backend/main.py`, NEW `frontend/src/sentinel-app/components/AttackerProfileCard.jsx`, `frontend/src/sentinel-app/components/AttackerIntelligence.jsx`
**Risk:** LOW
**Estimated complexity:** MEDIUM
**Dependency:** None

### [FEAT-8] Session Fingerprint Persistence
**Status:** main.py already reads X-Session-ID (line 88). api.ts uses fetch (not axios), no interceptor. uuid not in package.json.
**Gap:** Add session ID generation + header attachment in frontend
**Files to change:** `frontend/src/lib/api.ts`
**Risk:** LOW — use crypto.randomUUID() (no npm install needed)
**Estimated complexity:** SMALL
**Dependency:** None

### [FEAT-9] System Health Endpoint Wiring
**Status:** GET /health exists but LLM/SentinelML checks are fake. No /health/full. Widget calls /api/v1/health.
**Gap:** Add real health checks with latency, update widget
**Files to change:** `backend/app/api/health.py`, `backend/app/main.py` (add START_TIME), `frontend/src/sentinel-app/components/SystemHealthWidget.jsx`
**Risk:** LOW
**Estimated complexity:** SMALL
**Dependency:** None

### [FEAT-10] DEMO.md + README Update
**Status:** DEMO.md missing. README.md has no feature table or architecture diagram.
**Gap:** Create DEMO.md, update README.md
**Files to change:** NEW `DEMO.md`, `README.md`
**Risk:** LOW
**Estimated complexity:** SMALL
**Dependency:** All features done (to document accurately)

### [POLISH-1] Sidebar Section Grouping
**Status:** Flat 14-item list
**Gap:** Group into DETECTION/OPERATIONS/INTELLIGENCE/SYSTEM with labels and dividers
**Files to change:** `frontend/src/sentinel-app/components/Sidebar.jsx`
**Risk:** LOW
**Estimated complexity:** SMALL
**Dependency:** None (FEAT-5 adds Attack Graph nav item here)

### [POLISH-2] StatCard Real Trends
**Status:** Hardcoded trendValues ("12","5","2","0.1")
**Gap:** Compute real deltas using useRef in Dashboard.jsx
**Files to change:** `frontend/src/sentinel-app/components/Dashboard.jsx`, `frontend/src/sentinel-app/components/StatCard.jsx`
**Risk:** LOW
**Estimated complexity:** SMALL
**Dependency:** None

### [POLISH-3] ThreatMap with Real Blocked IP Data
**Status:** ThreatMapWidget shows hardcoded placeholder dots
**Gap:** Use blocked IP data from useAlerts, country→coordinate lookup
**Files to change:** `frontend/src/sentinel-app/components/ThreatMapWidget.jsx`
**Risk:** LOW
**Estimated complexity:** SMALL
**Dependency:** None

### [POLISH-4] Loading Skeleton States
**Status:** Some views show spinners, most show nothing when loading
**Gap:** Add pulsing skeleton cards to ForensicsView, RedTeamView, AttackerIntelligence, HealthView
**Files to change:** Multiple component files
**Risk:** LOW
**Estimated complexity:** SMALL
**Dependency:** None

### [POLISH-5] Execute Simulation Feedback
**Status:** Sets demoState='complete' silently after 5s
**Gap:** Show toast notification, auto-navigate to Threat Feed
**Files to change:** `frontend/src/sentinel-app/components/Topbar.jsx`
**Risk:** LOW
**Estimated complexity:** TRIVIAL
**Dependency:** None

### [POLISH-6] Keyboard Shortcuts
**Status:** None exist
**Gap:** D/F/R/I/T/Escape shortcuts in App.jsx
**Files to change:** `frontend/src/sentinel-app/App.jsx`
**Risk:** LOW
**Estimated complexity:** SMALL
**Dependency:** None

### [POLISH-7] Topbar Logo Fix
**Status:** `<img src="/logo.png">` — likely 404s
**Gap:** Replace with inline SVG ShieldCheck with cyan glow
**Files to change:** `frontend/src/sentinel-app/components/Topbar.jsx`
**Risk:** LOW
**Estimated complexity:** TRIVIAL
**Dependency:** None

### [POLISH-8] Mobile Responsiveness
**Status:** No auto-collapse logic
**Gap:** Auto-collapse sidebar at <1024px width
**Files to change:** `frontend/src/sentinel-app/App.jsx`
**Risk:** LOW
**Estimated complexity:** TRIVIAL
**Dependency:** None

---

## Execution Order

1. FIX-1 — Provider factory in honeypot_generator.py
2. FIX-2 — Provider factory in forensics.py + redteam.py
3. FIX-3 — DB models re-export
4. FIX-4 — core/config.py + core/security.py
5. FIX-5 — Service stubs
6. FEAT-9 — System health endpoint (small, unblocks widget)
7. FEAT-3 — Demo seed data (enables testing)
8. FEAT-2 — AI Threat Narrative (depends on FIX-2)
9. FEAT-4 — PDF export (depends on FIX-2)
10. FEAT-1 — WebSocket live feed
11. FEAT-6 — Telegram notifications
12. FEAT-7 — Attacker fingerprint cards
13. FEAT-8 — Session fingerprint persistence
14. POLISH-1 — Sidebar sections (before FEAT-5 adds nav item)
15. FEAT-5 — Attack Graph (D3, needs sidebar restructured)
16. POLISH-7 — Topbar logo fix
17. POLISH-5 — Execute simulation feedback
18. POLISH-2 — StatCard real trends
19. POLISH-3 — ThreatMap real data
20. POLISH-4 — Loading skeletons
21. POLISH-6 — Keyboard shortcuts
22. POLISH-8 — Mobile responsiveness
23. FEAT-10 — DEMO.md + README (last, documents everything)

---

## Red Flags

1. **22GB SQLite database** (`app.db` is 22,280,179,712 bytes). This may cause severe I/O issues and slow startup. Consider vacuuming or recreating.
2. **GeminiClient is a thin wrapper** — `llm_client.py` line 3-8 shows GeminiClient just calls `get_provider()` internally anyway. So FIX-1/FIX-2 are functionally correct already but the import name is misleading and should be fixed for OLLAMA_MODE clarity.
3. **SentinelML writes directly to app.db via raw sqlite3** (main.py line 317-338) bypassing SQLAlchemy entirely. This could cause locking issues with the Elyaitra backend.
4. **No `__init__.py`** in `backend/app/models/` directory — **CONFIRMED MISSING**. Python may still find modules via implicit namespace packages, but this is fragile. Should create an empty `__init__.py` during FIX-3.
5. **`utils/dependencies.py`** is empty — unclear if anything imports from it.
6. **init_db.py imports work correctly** — the user's description that it "imports from db/models.py" is incorrect. It imports from `app.models.*` subdirectory. The empty db/models.py is cosmetic, not a crash bug.
7. **api.ts uses `fetch()` not `axios`** — the session fingerprint (FEAT-8) interceptor described in the user's instructions assumes axios. Since sentinel-app components use `axios` directly (imported per-file), the interceptor should be added as an axios default header instead.
