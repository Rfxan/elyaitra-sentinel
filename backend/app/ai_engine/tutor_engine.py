# backend/app/ai_engine/tutor_engine.py

from typing import List, Dict

from app.ai_engine.retriever import retrieve
from app.ai_engine.providers import get_provider
from app.security.logger import send_log
import os
import time

def _load_prompt_file(filename: str) -> str:
    base_dir = os.path.dirname(os.path.abspath(__file__))  # ai_engine/
    prompt_path = os.path.join(base_dir, "prompts", filename)

    if not os.path.exists(prompt_path):
        raise RuntimeError(f"Prompt file not found: {prompt_path}")

    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read()

ALLOWED_MODES = {"chat", "flowchart", "flashcard", "quiz", "audio"}

class TutorEngine:
    def __init__(self):
        self.llm = get_provider()

    def respond(
        self,
        *,
        user_id: int,
        subject: str,
        unit: str,
        topic: str,
        mode: str,
        message: str,
        collection_name: str | None = None
    ) -> Dict[str, List[str] | str]:

        # --------------------
        # 1. Validate mode
        # --------------------
        if mode not in ALLOWED_MODES:
            raise ValueError(f"Invalid mode: {mode}")

        # --------------------
        # 2. Retrieve syllabus content
        # --------------------
        query = message if message else topic
        print(f"🔎 RAG DEBUG | Query: '{query}' | Subject: {subject} | Unit: {unit}")

        docs = retrieve(
            question=query,
            subject=subject,
            unit=unit,
            collection_name=collection_name
        )

        # --------------------
        # 3. Syllabus lock
        # --------------------
        if not docs:
            print("⚠️ RAG DEBUG | No documents found in database.")
            return {
                "answer": "❌ This is not in your syllabus. You can safely skip this.",
                "events": []
            }

        print(f"✅ RAG DEBUG | Found {len(docs)} relevant chunks.")
        syllabus_context = "\n".join(docs)
        print(f"📝 RAG DEBUG | Context Preview (100 chars): {syllabus_context[:100]}...")

        # --------------------
        # 4. Build prompt
        # --------------------
        system_prompt = self._get_system_prompt(mode)

        final_prompt = f"""{system_prompt}

---
CONTEXT FROM YOUR SYLLABUS (TOPIC: {topic}, SUBJECT: {subject}):
{syllabus_context}

---
STUDENT'S REQUEST:
{message}
"""

        # --------------------
        # 4.5. Log LLM Prompt (Security)
        # --------------------
        print(f"🤖 RAG DEBUG | Sending final prompt to Groq ({len(final_prompt)} chars)")
        send_log({
            "type": "llm",
            "prompt": final_prompt,
            "user": user_id,
            "timestamp": time.time()
        })

        # --------------------
        # 5. Generate answer
        # --------------------
        answer = self.llm.generate(final_prompt)

        # --------------------
        # 6. Emit events
        # --------------------
        events = self._emit_events(mode)

        return {
            "answer": answer.strip(),
            "events": events
        }

    # ------------------------
    # Helpers
    # ------------------------

    def _get_system_prompt(self, mode: str) -> str:
        if mode == "chat":
            return _load_prompt_file("chat.txt")

        if mode == "flashcard":
            return _load_prompt_file("flashcards.txt")

        if mode == "flowchart":
            return (
                "You are Elyaitra Tutor AI.\n"
                "Respond ONLY in flowchart format.\n"
                "• No paragraphs\n"
                "• Use arrows\n"
                "• Step-by-step logic\n"
                "• Exam relevant only\n"
            )

        if mode == "quiz":
            return (
                "You are Elyaitra Tutor AI.\n"
                "Ask ONE exam-style question only.\n"
                "Wait for student response.\n"
                "Do not give answers unless evaluating.\n"
            )

        if mode == "audio":
            return _load_prompt_file("audio.txt")

        return ""


    def _emit_events(self, mode: str) -> List[str]:
        if mode in {"chat", "flowchart"}:
            return ["EXPLANATION_REQUESTED"]

        if mode == "flashcard":
            return ["TOPIC_VIEWED"]

        if mode == "quiz":
            return ["QUIZ_ATTEMPTED"]

        return []
