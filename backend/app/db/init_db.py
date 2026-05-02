from app.db.database import engine, Base
from app.models.user import User
from app.models.payment import Payment
from app.models.flashcard import Flashcard
from app.models.flowchart import Flowchart
from app.models.attack_event import AttackEvent
from app.models.redteam import RedTeamSession
from app.models.user_request import UserRequest
from app.models.room import Room, RoomMessage

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
    print("Database initialized.")
