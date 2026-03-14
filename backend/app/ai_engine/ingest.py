import os
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.ai_engine.chroma_client import get_collection

print("🔥🔥🔥 INGEST MODULE LOADED 🔥🔥🔥")

# --------------------------------------------------
# ENV
# --------------------------------------------------
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
print("🔑 GEMINI KEY EXISTS:", bool(API_KEY))

if not API_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY not set")

genai.configure(api_key=API_KEY)

SUBJECT = "chemistry"

# --------------------------------------------------
# PATHS
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(BASE_DIR)
BACKEND_DIR = os.path.dirname(APP_DIR)

DATA_PATH = os.path.join(BACKEND_DIR, "syllabus_data", SUBJECT)

print("📁 DATA_PATH =", DATA_PATH)

if not os.path.exists(DATA_PATH):
    raise RuntimeError(f"❌ syllabus_data not found at {DATA_PATH}")

print("📄 Files found:", os.listdir(DATA_PATH))

# --------------------------------------------------
# GET CHROMA COLLECTION
# --------------------------------------------------
print("🔌 Getting Chroma collection...")
collection = get_collection(SUBJECT)
print("✅ Got Chroma collection")

# --------------------------------------------------
# SPLITTER
# --------------------------------------------------
splitter = RecursiveCharacterTextSplitter(
    chunk_size=300,
    chunk_overlap=50
)

# --------------------------------------------------
# EMBED
# --------------------------------------------------
def embed(text: str) -> list[float]:
    print("🧠 Embedding chunk...")
    result = genai.embed_content(
        model="models/gemini-embedding-001",
        content=text
    )
    return result["embedding"]

# --------------------------------------------------
# INGEST
# --------------------------------------------------
def ingest():
    print("🚀 INGEST() STARTED")

    # Clear collection
    try:
        collection.delete(where={})
        print("🧹 Cleared collection")
    except Exception as e:
        print("⚠️ Could not clear collection:", e)

    doc_id = 0
    files_processed = 0
    chunks_added = 0

    for file in os.listdir(DATA_PATH):
        print("👀 Found file:", file)

        if not file.lower().endswith(".txt"):
            print("⏭️ Skipping non-txt:", file)
            continue

        unit = file.replace("unit", "").replace(".txt", "")
        print(f"📄 Reading: {file} | unit: {unit}")
        files_processed += 1

        path = os.path.join(DATA_PATH, file)
        print("📂 Opening:", path)

        with open(path, "r", encoding="utf-8") as f:
            text = f.read().strip()

        print("📏 File length:", len(text))

        if not text:
            print("⚠️ Empty file:", file)
            continue

        chunks = splitter.split_text(text)
        print("✂️ Chunks created:", len(chunks))

        for chunk in chunks:
            print("➕ Adding chunk", doc_id)

            collection.add(
                documents=[chunk],
                embeddings=[embed(chunk)],
                metadatas=[{
                    "subject": SUBJECT,
                    "unit": str(unit),
                    "source": file
                }],
                ids=[f"{SUBJECT}_{doc_id}"]
            )
            doc_id += 1
            chunks_added += 1

    print(f"✅ DONE | files={files_processed}, chunks={chunks_added}")
    print("📊 FINAL CHROMA COUNT:", collection.count())


if __name__ == "__main__":
    ingest()
