import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))
os.environ["DATABASE_URL"] = "sqlite:///app.db"

from fastapi.testclient import TestClient
from app.main import app
from app.db.database import SessionLocal
from app.models.user_request import UserRequest

client = TestClient(app)

def test_integrity_flow():
    print("--- Testing Student Integrity Scoring ---")
    db = SessionLocal()
    
    # 1. Insert mock data for user 999
    # 10 total requests, 2 malicious -> score 80
    for i in range(8):
        db.add(UserRequest(user_id=999, ip="1.2.3.4", path="/ai/tutor", is_malicious=False))
    for i in range(2):
        db.add(UserRequest(user_id=999, ip="1.2.3.4", path="/ai/tutor", is_malicious=True))
    db.commit()
    print("✅ Mock request logs inserted for user 999.")

    # 2. Test GET /integrity/score/999
    print("Testing GET /integrity/score/999...")
    resp = client.get("/integrity/score/999")
    assert resp.status_code == 200
    data = resp.json()
    assert data["score"] == 80.0
    assert data["status"] == "CLEAN" # 80 is CLEAN (threshold < 80 is suspicious)
    print(f"✅ User Score: {data['score']} | Status: {data['status']}")

    # 3. Test Leaderboard
    print("Testing GET /integrity/leaderboard...")
    resp = client.get("/integrity/leaderboard")
    assert resp.status_code == 200
    leaderboard = resp.json()
    assert len(leaderboard) >= 1
    print(f"✅ Leaderboard fetched. Top user: {leaderboard[0]['user_id']} with score {leaderboard[0]['score']}")

    print("\n--- INTEGRITY TESTS COMPLETED ---")
    db.close()

if __name__ == "__main__":
    try:
        test_integrity_flow()
    except Exception as e:
        print(f"❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
