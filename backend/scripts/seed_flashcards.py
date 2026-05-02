import sqlite3
from pathlib import Path

DB_PATH = (
    Path(__file__).resolve()
    .parent.parent
    / "app"
    / "db"
    / "elyaitra.db"
)

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# 🔥 DEBUG PRINT (IMPORTANT)
print("Seeding DB at:", DB_PATH)

flashcards = [
    {
        "subject": "chemistry",
        "unit": "3",
        "question": "What is a for loop?",
        "answer": "A for loop is a control structure used to repeat code a fixed number of times."
    }
]

for fc in flashcards:
    cur.execute(
        """
        INSERT INTO flashcards (subject, unit, question, answer)
        VALUES (?, ?, ?, ?)
        """,
        (fc["subject"], fc["unit"], fc["question"], fc["answer"]),
    )

conn.commit()
conn.close()

print("✅ Flashcards seeded")
