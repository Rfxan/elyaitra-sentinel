import requests
import json
from typing import List
from app.ai_engine.providers.base import LLMProvider

class OllamaProvider(LLMProvider):
    def __init__(self, base_url: str = "http://localhost:11434", model_name: str = "llama3.1:8b", embedding_model: str = "nomic-embed-text"):
        self.base_url = base_url
        self.model_name = model_name
        self.embedding_model = embedding_model

    def generate(self, prompt: str) -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False
        }
        try:
            response = requests.post(url, json=payload, timeout=90)
            response.raise_for_status()
            return response.json().get("response", "").strip()
        except Exception as e:
            print(f"❌ OLLAMA GENERATE ERROR: {e}")
            raise e

    def embed(self, text: str) -> List[float]:
        """Generate embeddings for a single text."""
        result = self.embed_batch([text])
        return result[0] if result else []

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a batch of texts using the modern /api/embed endpoint."""
        url = f"{self.base_url}/api/embed"
        payload = {
            "model": self.embedding_model,
            "input": texts
        }
        try:
            response = requests.post(url, json=payload, timeout=60)
            
            # If 404, fall back to the legacy /api/embeddings for backward compatibility
            if response.status_code == 404:
                print("⚠️ /api/embed not found, falling back to legacy /api/embeddings")
                return [self._embed_legacy(t) for t in texts]
                
            response.raise_for_status()
            return response.json().get("embeddings", [])
        except Exception as e:
            print(f"❌ OLLAMA EMBED ERROR: {e}")
            raise e

    def _embed_legacy(self, text: str) -> List[float]:
        """Legacy embedding endpoint for older Ollama versions."""
        url = f"{self.base_url}/api/embeddings"
        payload = {
            "model": self.embedding_model,
            "prompt": text
        }
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        return response.json().get("embedding", [])
