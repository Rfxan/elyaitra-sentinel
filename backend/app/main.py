from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.security.logger import send_log
import time

import os
import warnings
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

from app.db.init_db import init_db

# 🔥 TEMP DEBUG: IMPORT INGEST
from app.ai_engine.ingest import ingest

app = FastAPI(title="Elyaitra Backend", version="0.1.0")

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
        "timestamp": time.time()
    })

    # 🛡️ GLOBAL HONEYPOT CHECK
    # Check if IP is blocked in SentinelML and intercept with a honeypot
    from app.security.logger import get_honeypot_response
    from fastapi.responses import JSONResponse
    
    honeypot_answer = get_honeypot_response(ip)
    if honeypot_answer:
        print(f"🍯 HONEYPOT | Intercepting request to {path} from {ip}")
        return JSONResponse(content={
            "answer": honeypot_answer,
            "events": ["HONEYPOT_ACTIVE", "DECEPTION_ENGAGED", "GLOBAL_INTERCEPT"]
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
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(content_router)
app.include_router(payments_router)
app.include_router(access_router)
app.include_router(ai_router)
app.include_router(admin_router)
app.include_router(flashcards_router)


# ---------------------------
# LOCAL RUN
# ---------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
