import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set")

genai.configure(api_key=API_KEY)


class GeminiClient:
    def __init__(self):
        # ✅ Latest Gemini Flash model (2.5 Flash)
        self.model = genai.GenerativeModel("models/gemini-2.5-flash")

    def generate(self, prompt: str) -> str:
        try:
            response = self.model.generate_content(prompt)

            # Normal case
            if hasattr(response, "text") and response.text:
                return response.text.strip()

            # Fallback parsing
            if hasattr(response, "candidates") and response.candidates:
                cand = response.candidates[0]
                if hasattr(cand, "content") and hasattr(cand.content, "parts"):
                    parts = cand.content.parts
                    if parts and hasattr(parts[0], "text"):
                        return parts[0].text.strip()

            print("⚠️ Gemini returned empty response:", response)
            return "The AI model returned an empty response."

        except Exception as e:
            print("❌ GEMINI ERROR:", repr(e))
            return "The AI model is temporarily unavailable. Please try again."
