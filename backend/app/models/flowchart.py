from sqlalchemy import Column, Integer, String
from app.db.database import Base

class Flowchart(Base):
    __tablename__ = "flowcharts"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    unit = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    image_path = Column(String, nullable=False)
