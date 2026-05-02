import httpx
import json
import logging
import time

from llm import generate_text

logger = logging.getLogger(__name__)

# Ollama settings
OLLAMA_BASE_URL = "http://localhost:11434"
GENERATE_MODEL = "llama3:latest"
EMBED_MODEL = "llama3:latest" # Fallback if nomic is missing, though llama3 isn't an embed model usually

# Simple memory cache for AI summary
_summary_cache = {
    "timestamp": 0,
    "summary": "No significant activity generated yet."
}
CACHE_TTL = 10  # 10 seconds

def embed_text(text: str) -> list[float]:
    """
    Generate embeddings for semantic search or clustering.
    """
    try:
        with httpx.Client(timeout=2.0) as client:
            resp = client.post(
                f"{OLLAMA_BASE_URL}/api/embeddings",
                json={
                    "model": EMBED_MODEL,
                    "prompt": text
                }
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("embedding", [])
    except Exception as e:
        logger.error(f"Ollama embedding failed: {e}")
        return []

def generate_incident_summary(events: list) -> str:
    """
    Generate a concise cybersecurity summary of recent events.
    Caches the response for CACHE_TTL seconds.
    """
    global _summary_cache
    
    print(f"🎬 AI | Generating summary for {len(events)} events...")
    
    current_time = time.time()
    if current_time - _summary_cache["timestamp"] < CACHE_TTL:
        return _summary_cache["summary"]

    # Limit to max 20 events to save context window and processing time
    recent_events = events[:20] if len(events) > 20 else events
    
    if not recent_events:
        summary = "Network activity is nominal. No significant threats detected."
        _summary_cache = {"timestamp": current_time, "summary": summary}
        return summary
    
    # Calculate some quick stats for the prompt
    total = len(recent_events)
    attacks = sum(1 for e in recent_events if e.get("type", "") == "attack")
    evasions = sum(1 for e in recent_events if e.get("type", "") == "evasion")
    poisoning = sum(1 for e in recent_events if e.get("type", "") == "poison")
    blocked = sum(1 for e in recent_events if e.get("status", "") == "blocked")
    
    # Simplify the JSON payload to send only what's necessary to avoid large contexts
    simplified_events = []
    for e in recent_events:
        simplified_events.append({
            "type": e.get("type"),
            "blocked": e.get("status") == "blocked",
            "confidence": e.get("confidence")
        })

    prompt = f"""You are a senior SOC cybersecurity analyst. 
Analyze these recent {total} security events and produce a concise summary (3-5 sentences).
Focus strongly on threats, adversarial behavior, and system response. Be direct and analytical.

Quick Stats:
- Attacks: {attacks}
- Evasions: {evasions}
- Poisoning: {poisoning}
- Blocked actions: {blocked}

Event sequence (simplified):
{json.dumps(simplified_events)}

Summary:"""
    
    # We wait up to 30s for a summary
    summary = generate_text(prompt, max_timeout=30.0)
    
    _summary_cache = {"timestamp": current_time, "summary": summary}
    return summary

def explain_event(event: dict) -> str:
    """
    Translates a single raw event into a natural language explanation.
    """
    event_type = event.get("type", "unknown")
    confidence = event.get("confidence", 0.0)
    blocked = event.get("status") == "blocked"
    
    prompt = f"""Explain this security event to a junior analyst in 1-2 sentences. 
    Event details: Type={event_type}, Confidence={confidence}, Blocked={blocked}.
    Be highly specific to the type of threat."""
    
    return generate_text(prompt, max_timeout=30.0)
