import os
from dotenv import load_dotenv
from app.ai_engine.providers.gemini import GeminiProvider
from app.ai_engine.providers.ollama import OllamaProvider
from app.ai_engine.providers.base import LLMProvider
from app.ai_engine import config

load_dotenv()

def get_provider() -> LLMProvider:
    provider_type = config.LLM_PROVIDER
    
    if provider_type == "ollama":
        try:
            # Try to get Ollama provider
            return OllamaProvider(
                base_url=config.OLLAMA_BASE_URL,
                model_name=config.OLLAMA_DEFAULT_MODEL,
                embedding_model=config.OLLAMA_EMBEDDING_MODEL
            )
        except Exception as e:
            if config.FALLBACK_TO_GEMINI:
                print(f"⚠️ Ollama provider setup failed ({e}). Falling back to Gemini.")
                return _get_gemini_provider()
            else:
                raise e
    
    return _get_gemini_provider()

def _get_gemini_provider() -> GeminiProvider:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set in environment")
    
    return GeminiProvider(
        api_key=api_key,
        model_name=config.GEMINI_DEFAULT_MODEL,
        embedding_model=config.GEMINI_EMBEDDING_MODEL
    )
