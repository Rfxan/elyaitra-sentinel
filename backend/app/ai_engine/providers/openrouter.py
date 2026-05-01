import requests
import json
from typing import List
from app.ai_engine.providers.base import LLMProvider

class OpenRouterProvider(LLMProvider):
    def __init__(self, api_key: str, model_name: str = "meta-llama/llama-3.1-8b-instruct"):
        self.api_key = api_key
        self.model_name = model_name
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"

    def generate(self, prompt: str) -> str:
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8080", # Optional, for OpenRouter rankings
                "X-Title": "Elyaitra AI"
            }
            
            data = {
                "model": self.model_name,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.5,
                "max_tokens": 1024
            }

            response = requests.post(self.base_url, headers=headers, json=data, timeout=45)
            
            if response.status_code != 200:
                print(f"❌ OPENROUTER ERROR ({response.status_code}): {response.text}")
                return f"Error: {response.status_code} - {response.json().get('error', {}).get('message', 'Unknown error')}"
            
            result = response.json()
            return result["choices"][0]["message"]["content"].strip()
            
        except Exception as e:
            print(f"❌ EXCEPTION IN OPENROUTER: {e}")
            return f"Error: {str(e)}"

    def embed(self, text: str) -> List[float]:
        raise NotImplementedError("OpenRouterProvider does not support native embeddings.")
