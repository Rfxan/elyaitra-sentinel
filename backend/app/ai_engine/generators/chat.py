import os
from app.ai_engine.retriever import retrieve
from app.ai_engine.providers import get_provider

llm = get_provider()

# --------------------------------------------------
# Load rules from chat.txt (SYSTEM PROMPT)
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROMPT_PATH = os.path.join(BASE_DIR, "prompts", "chat.txt")

print("PROMPT PATH:", PROMPT_PATH)
print("PROMPT EXISTS:", os.path.exists(PROMPT_PATH))

with open(PROMPT_PATH, "r", encoding="utf-8") as f:
    SYSTEM_PROMPT = f.read().strip()


def generate_chat_response(question: str, subject: str) -> str:
    """
    Subject-bounded RAG pipeline
    """

    subject = subject.lower().strip()
    chunks = retrieve(question, subject)

    # --------------------------------------------------
    # Case 1: No syllabus chunks found
    # --------------------------------------------------
    if not chunks:
        prompt = f"""
{SYSTEM_PROMPT}

You are an exam-focused tutor for the subject {subject}.
Answer clearly and concisely.
If the concept is indirectly related, explain it briefly.

Question:
{question}

Answer:
"""
        return (
            "This topic is part of the syllabus, but not explicitly "
            "covered in the provided text. Here is a brief explanation:\n\n"
            + llm.generate(prompt)
        )

    # --------------------------------------------------
    # Case 2: Syllabus context found (STRICT RAG)
    # --------------------------------------------------
    context = "\n\n".join(chunks)

    prompt = f"""
{SYSTEM_PROMPT}

--- SYLLABUS CONTEXT ---
{context}

--- QUESTION ---
{question}

--- ANSWER ---
"""

    return llm.generate(prompt)
