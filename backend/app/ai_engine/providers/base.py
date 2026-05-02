from abc import ABC, abstractmethod
from typing import List

class LLMProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str) -> str:
        """Generate text from a prompt."""
        pass

    @abstractmethod
    def embed(self, text: str) -> List[float]:
        """Generate embeddings for text."""
        pass

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a batch of texts."""
        return [self.embed(t) for t in texts]
