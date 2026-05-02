import sys
import os

# Absolute path to backend/
BACKEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

# Add backend/ to Python path
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.db.init_db import init_db

print("➡️ Creating database tables (ONE TIME)")
init_db()
print("✅ Tables ready")
