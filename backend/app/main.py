from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
# STARTUP
# ---------------------------
@app.on_event("startup")
def startup_event():
    print("🚀 Backend started")
    init_db()

    # 🔥🔥🔥 TEMP: FORCE INGEST FOR DEBUG
    print("🔥 CALLING INGEST FROM STARTUP (OLLAMA MODE) 🔥")
    try:
        ingest()
    except Exception as e:
        print("❌ INGEST ERROR:", repr(e))

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
