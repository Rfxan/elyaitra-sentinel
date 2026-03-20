from app.ai_engine.providers import get_provider

class GeminiClient:
    def __init__(self):
        self.provider = get_provider()

    def generate(self, prompt: str) -> str:
        return self.provider.generate(prompt)
