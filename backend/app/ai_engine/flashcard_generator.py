from app.ai_engine.providers import get_provider

provider = get_provider()

def generate_flashcards(docs: list[str]) -> list[dict]:
    if not docs:
        return []

    prompt = f"""
You are an exam-oriented tutor.

Convert the following syllabus content into concise flashcards.

Rules:
- Focus strictly on syllabus concepts
- Simple definitions, laws, principles
- No extra explanation
- Generate EXACTLY 5 flashcards
- Format strictly as:

Q: question
A: answer

Syllabus content:
{chr(10).join(docs)}
"""

    try:
        response_text = provider.generate(prompt)

        if not response_text:
            return []

        flashcards = []
        q = None

        for line in response_text.splitlines():
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
