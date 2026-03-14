import os
from dotenv import load_dotenv
import google.generativeai as genai
from app.ai_engine.chroma_client import get_collection

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set")

genai.configure(api_key=API_KEY)


def embed(text: str) -> list[float]:
    result = genai.embed_content(
        model="models/gemini-embedding-001",
        content=text
    )
    return result["embedding"]


def retrieve(question: str, subject: str, unit: int | None = None, k: int = 5):
    try:
        print("🔍 RETRIEVE CALLED WITH:")
        print("   subject =", subject)
        print("   unit    =", unit)
        print("   question=", question)

        collection = get_collection(subject)
        print(f"📊 Collection {subject} count: {collection.count()}")
        
        emb = embed(question)
        print(f"🧠 Generated embedding length: {len(emb)}")
        
        where_clause = {"unit": str(unit)} if unit else {}
        print(f"🔎 Querying with where={where_clause}")

        results = collection.query(
            query_embeddings=[emb],
            n_results=k,
            where=where_clause
        )

        print("📦 RAW CHROMA RESULTS:")
        print(results)

        docs = results.get("documents", [[]])[0]

        print("📄 DOC COUNT:", len(docs))

        return docs

    except Exception as e:
        print("❌ Retrieval error:", e)
        return []

