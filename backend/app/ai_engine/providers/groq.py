import requests
import json
from typing import List
from app.ai_engine.providers.base import LLMProvider

class GroqProvider(LLMProvider):
    def __init__(self, api_key: str, model_name: str = "llama-3.3-70b-versatile"):
        self.api_key = api_key
        self.model_name = model_name
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

    def generate(self, prompt: str) -> str:
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model_name,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.5,
                "max_tokens": 1024
            }

            response = requests.post(self.base_url, headers=headers, json=data, timeout=30)
            
            if response.status_code != 200:
                print(f"❌ GROQ ERROR ({response.status_code}): {response.text}")
                return f"Error: {response.status_code} - {response.json().get('error', {}).get('message', 'Unknown error')}"
            
            result = response.json()
            return result["choices"][0]["message"]["content"].strip()
            
        except Exception as e:
            print(f"❌ EXCEPTION IN GROQ: {e}")
            return f"Error: {str(e)}"

    def embed(self, text: str) -> List[float]:
        # Groq doesn't provide embeddings in the same API
        # This shouldn't be called if retriever uses embeddings.py's native model
        raise NotImplementedError("GroqProvider does not support native embeddings. Use embeddings.py instead.")
