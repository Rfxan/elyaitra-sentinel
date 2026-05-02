from pydantic import BaseModel

class FlashcardOut(BaseModel):
    id: int
    subject: str
    unit: str
    question: str
    answer: str

    class Config:
        orm_mode = True
