from app.ai_engine.providers import get_provider

provider = get_provider()


def generate_flashcards(docs: list[str]) -> list[dict]:
    if not docs:
        return []

    prompt = f"""
You are an exam-oriented tutor.

Convert the following syllabus content into EXACTLY 5 flashcards.

Rules:
- Strictly syllabus-based
- Simple definitions
- No extra explanation
- Format exactly as:

Q: question
A: answer

Syllabus:
{chr(10).join(docs)}
"""

    try:
        text = provider.generate(prompt)

        flashcards = []
        q = None

        for line in text.splitlines():
            line = line.strip()
            if line.startswith("Q:"):
                q = line[2:].strip()
            elif line.startswith("A:") and q:
                flashcards.append({
                    "question": q,
                    "answer": line[2:].strip()
                })
                q = None

        return flashcards[:5]

    except Exception as e:
        print("❌ Generation failed:", e)
        return []
