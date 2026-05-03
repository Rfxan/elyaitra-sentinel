from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.security.logger import send_log
import time
from app.core.state import START_TIME

import os
import logging
import warnings
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.utils.limiter import limiter
from starlette.requests import Request
from starlette.responses import JSONResponse
import asyncio
import sys

# Suppress google-generativeai FUTURE WARN which breaks uvicorn reload on Windows
warnings.filterwarnings("ignore", category=FutureWarning)

# Fix Uvicorn reload crashing with KeyboardInterrupt/CancelledError on Windows Python 3.14
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.payments import router as payments_router
from app.api.access import router as access_router
from app.api.content import router as content_router
from app.api.ai import router as ai_router
from app.api.admin import router as admin_router
from app.api.flashcards import router as flashcards_router
from app.routers.forensics import router as forensics_router
from app.routers.redteam import router as redteam_router
from app.api.integrity import router as integrity_router
from app.routers.rooms import router as rooms_router
from app.routers.demo import router as demo_router

from app.db.init_db import init_db

# 🔥 TEMP DEBUG: IMPORT INGEST
from app.ai_engine.ingest import ingest

# Core Instances
app = FastAPI(title="Elyaitra AI Sentinel", version="0.1.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_id = str(time.time()).replace(".", "")[-6:]
    print(f"🔥 [ERR-{error_id}] UNHANDLED ERROR: {exc}")
    
    # Standardized schema per Task 68
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": f"An internal sentinel error occurred (Ref: {error_id}).",
            "code": 500
        },
    )

# ---------------------------
# CORS
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "https://elyaitra-vite.vercel.app",
        "https://elyaitra.com",
        "https://www.elyaitra.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# SECURITY LOGGING MIDDLEWARE
# ---------------------------
@app.middleware("http")
async def security_logging_middleware(request: Request, call_next):
    # Capture request details
    ip = request.client.host if request.client else "unknown"
    method = request.method
    path = request.url.path
    session_id = request.headers.get("X-Session-ID", "sess_" + ip.replace(".", "_"))
    
    # Safely read body
    body_content = ""
    try:
        # Only attempt to read body for methods that typically have one
        if method in ["POST", "PUT", "PATCH"]:
            body_bytes = await request.body()
            # Re-inject body for downstream handlers
            async def receive():
                return {"type": "http.request", "body": body_bytes}
            request._receive = receive
            
            try:
                body_content = body_bytes.decode("utf-8")
            except:
                body_content = "<binary/unparseable>"
    except Exception:
        pass

    # Send log (non-blocking)
    send_log({
        "type": "request",
        "ip": ip,
        "method": method,
        "path": path,
        "body": body_content,
        "session_id": session_id,
        "timestamp": time.time()
    })

    # 🛡️ GLOBAL HONEYPOT CHECK
    # Check if IP is blocked in SentinelML and intercept with a honeypot
    from app.security.logger import get_honeypot_response
    from fastapi.responses import JSONResponse
    import json
    
    # Try to extract topic from body
    detected_topic = "General Syllabus"
    try:
        if body_content:
            body_json = json.loads(body_content)
            detected_topic = body_json.get("topic", detected_topic)
    except:
        pass

    honeypot_answer = get_honeypot_response(ip, query=body_content, topic=detected_topic)
    if honeypot_answer:
        print(f"🍯 HONEYPOT | Intercepting request to {path} from {ip} (Topic: {detected_topic})")
        
        # Log the honeypot event
        send_log({
            "type": "HONEYPOT_TRIGGERED",
            "ip": ip,
            "method": method,
            "path": path,
            "body": body_content,
            "honeypot_variant": os.getenv("HONEYPOT_MODE", "static"),
            "detected_topic": detected_topic,
            "session_id": session_id,
            "timestamp": time.time()
        })

        return JSONResponse(content={
            "answer": honeypot_answer,
            "events": ["HONEYPOT_ACTIVE", "DECEPTION_ENGAGED", "GLOBAL_INTERCEPT"],
            "honeypot_variant": os.getenv("HONEYPOT_MODE", "static"),
            "detected_topic": detected_topic
        })

    # Continue request
    response = await call_next(request)
    return response

# ---------------------------
# STARTUP
# ---------------------------
@app.on_event("startup")
def startup_event():
    print("🚀 Backend started")
    init_db()


# ---------------------------
# 🔥 MANUAL INGEST ENDPOINT
# ---------------------------
@app.get("/ingest")
def run_ingest():
    try:
        ingest()
        return {"status": "ingest complete"}
    except Exception as e:
        return {"error": str(e)}
# ---------------------------
# ROUTERS
# ---------------------------
# ---------------------------
# ROUTERS (Versioning API v1)
# ---------------------------
API_PREFIX = "/api/v1"

app.include_router(health_router, prefix=API_PREFIX)
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(content_router, prefix=API_PREFIX)
app.include_router(payments_router, prefix=API_PREFIX)
app.include_router(access_router, prefix=API_PREFIX)
app.include_router(ai_router, prefix=API_PREFIX)
app.include_router(admin_router, prefix=API_PREFIX)
app.include_router(flashcards_router, prefix=API_PREFIX)
app.include_router(forensics_router, prefix=API_PREFIX)
app.include_router(redteam_router, prefix=API_PREFIX)
app.include_router(integrity_router, prefix=API_PREFIX)
app.include_router(rooms_router, prefix=API_PREFIX)
app.include_router(demo_router, prefix=API_PREFIX)

@app.get("/health")
def health_check():
    return {"status": "operational", "version": "0.1.0", "system": "AI Sentinel"}


# ---------------------------
# LOCAL RUN
# ---------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
