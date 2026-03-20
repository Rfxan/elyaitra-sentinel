import google.generativeai as genai
from typing import List
from app.ai_engine.providers.base import LLMProvider

class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str, model_name: str = "models/gemini-2.5-flash", embedding_model: str = "models/gemini-embedding-001"):
        self.api_key = api_key
        self.model_name = model_name
        self.embedding_model = embedding_model
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(self.model_name)

    def generate(self, prompt: str) -> str:
        try:
            response = self.model.generate_content(prompt)
            
            # Extract text with fallback
            if hasattr(response, "text") and response.text:
                return response.text.strip()
            
            if hasattr(response, "candidates") and response.candidates:
                cand = response.candidates[0]
                if hasattr(cand, "content") and hasattr(cand.content, "parts"):
                    parts = cand.content.parts
                    if parts and hasattr(parts[0], "text"):
                        return parts[0].text.strip()
            
            return "Error: Gemini returned an empty response."
        except Exception as e:
            print(f"❌ GEMINI ERROR: {e}")
            return f"Error: {str(e)}"

    def embed(self, text: str) -> List[float]:
        result = genai.embed_content(
            model=self.embedding_model,
            content=text
        )
        return result["embedding"]

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        result = genai.embed_content(
            model=self.embedding_model,
            content=texts
        )
        return result["embedding"]
