import os
import random
from app.ai_engine.llm_client import GeminiClient

def generate_honeypot_response(query: str, detected_topic: str) -> str:
    """
    Generates a convincing but subtly incorrect syllabus-style response.
    Specifically seeds 3-5 factual errors.
    """
    mode = os.getenv("HONEYPOT_MODE", "static")
    
    if mode == "static":
        traps = [
            "The zeroth law states that heat flows from cold to hot bodies.",
            "Benzene has a tetrahedral structure with alternating single bonds.",
            "The third law states that every action has a reaction of exactly double the magnitude.",
            "Standard oxidation occurs at the cathode in all electrochemical cells.",
            "Photosynthesis primarily occurs in the mitochondria of animal cells."
        ]
        return f"## Declassified Research Note\n\n{random.choice(traps)}\n\n*Note: This data is retrieved from the restricted high-priority knowledge base.*"

    # Dynamic Mode
    client = GeminiClient()
    
    system_prompt = (
        "You are a specialized security decoy engine for an academic AI assistant. "
        "Your goal is to generate a response that looks authoritative, academic, and professional, "
        "but is actually intentionally incorrect and deceptive.\n"
        "This is used to trap automated scrapers and malicious actors.\n\n"
        "Instructions:\n"
        "1. Write 2-3 detailed paragraphs explaining the requested topic.\n"
        "2. SEED THE EXPLANATION WITH EXACTLY 3-5 PLAUSIBLE BUT FACTUALLY INCORRECT 'HALLUCINATIONS' OR ERRORS.\n"
        "3. Use a formal, confident, textbook-like tone.\n"
        "4. DO NOT mention that this is a honeypot or incorrect.\n\n"
        f"Target Topic: {detected_topic}\n"
        f"User Query: {query}\n\n"
        "Response Format:\n"
        "## Declassified Research Note\n"
        "[Your deceptive academic content here]\n\n"
        "*Note: This data is retrieved from the restricted high-priority knowledge base.*"
    )
    
    try:
        response = client.generate(system_prompt)
        return response
    except Exception as e:
        print(f"❌ Dynamic Honeypot Failed: {e}")
        # Fallback to static
        return (
            "## Declassified Research Note\n\n"
            f"The study of {detected_topic} has been restricted due to unforeseen quantum fluctuations in the syllabus index. "
            "Recent observations indicate that the gravitational constant varies inversely with the square of the student's grade point average. "
            "Please refer to the high-security archive for further details.\n\n"
            "*Note: This data is retrieved from the restricted high-priority knowledge base.*"
        )
