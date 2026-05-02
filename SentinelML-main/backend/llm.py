import os
import httpx
import logging

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
LLM_MODE = os.environ.get("LLM_MODE", "hybrid").lower()

def generate_with_groq(prompt: str, max_timeout: float = 30.0) -> str:
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not set")
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Trim long prompts
    trimmed_prompt = prompt[:4000]
    
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are a cybersecurity analyst."},
            {"role": "user", "content": trimmed_prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 150 # Limit output size
    }
    
    with httpx.Client(timeout=max_timeout) as client:
        resp = client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()


def generate_with_ollama(prompt: str, max_timeout: float = 30.0) -> str:
    OLLAMA_BASE_URL = "http://localhost:11434"
    GENERATE_MODEL = "llama3:latest"
    
    # Trim long prompts
    trimmed_prompt = prompt[:4000]
    
    # Debug
    print(f"🤖 OLLAMA | Prompt: {trimmed_prompt[:100]}...", flush=True)
    
    with httpx.Client(timeout=max_timeout) as client:
        resp = client.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": GENERATE_MODEL,
                "prompt": trimmed_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2,
                    "num_predict": 100 # Limit output size
                }
            }
        )
        print(f"🤖 OLLAMA | Status: {resp.status_code}", flush=True)
        resp.raise_for_status()
        data = resp.json()
        ans = data.get("response", "").strip()
        print(f"🤖 OLLAMA | Ans length: {len(ans)}", flush=True)
        return ans


def generate_text(prompt: str, max_timeout: float = 30.0) -> str:
    if LLM_MODE == "grok_only" or LLM_MODE == "groq_only":
        try:
            logger.info("Using Groq")
            return generate_with_groq(prompt, max_timeout)
        except Exception as e:
            logger.error(f"Groq failed: {e}")
            return "AI insights temporarily unavailable"
            
    elif LLM_MODE == "ollama_only":
        try:
            logger.info("Using Ollama")
            return generate_with_ollama(prompt, max_timeout)
        except Exception as e:
            logger.error(f"Ollama failed: {e}")
            return "AI insights temporarily unavailable"
            
    else: # Hybrid mode (default)
        try:
            logger.info("Using Groq")
            return generate_with_groq(prompt, max_timeout)
        except Exception as e:
            logger.warning(f"Groq failed, using Ollama. (Error: {e})")
            try:
                return generate_with_ollama(prompt, max_timeout)
            except Exception as oe:
                logger.error(f"Ollama also failed: {oe}")
                return "AI insights temporarily unavailable"
