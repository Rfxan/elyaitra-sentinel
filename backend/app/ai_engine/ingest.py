import os
import time
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.ai_engine.chroma_client import get_collection, get_client

print("🔥🔥🔥 INGEST MODULE LOADED 🔥🔥🔥")

# --------------------------------------------------
# ENV
# --------------------------------------------------
load_dotenv()

from app.ai_engine.embeddings import get_embeddings

# --------------------------------------------------
# LLM PROVIDER (INGEST ONLY USES OLLAMA)
# --------------------------------------------------
print("🚀 Starting ingest with Ollama embeddings")
embeddings = get_embeddings()

SUBJECT = "chemistry"

# --------------------------------------------------
# PATHS
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(BASE_DIR)
BACKEND_DIR = os.path.dirname(APP_DIR)

DATA_PATH = os.path.join(BACKEND_DIR, "syllabus_data", SUBJECT)

if not os.path.exists(DATA_PATH):
    raise RuntimeError(f"❌ syllabus_data not found at {DATA_PATH}")

# --------------------------------------------------
# GET CHROMA COLLECTION
# --------------------------------------------------
# We will get the collection inside ingest() after a potential reset
collection = None

# --------------------------------------------------
# SPLITTER
# --------------------------------------------------
splitter = RecursiveCharacterTextSplitter(
    chunk_size=300,
    chunk_overlap=50
)

# --------------------------------------------------
# HELPERS
# --------------------------------------------------
def extract_text_from_pdf(path: str) -> str:
    from pypdf import PdfReader
    print(f"📄 Extracting PDF: {os.path.basename(path)}")
    reader = PdfReader(path)
    text = ""
    for page in reader.pages:
        content = page.extract_text()
        if content:
            text += content + "\n"
    return text

def extract_text_from_docx(path: str) -> str:
    from docx import Document
    print(f"📝 Extracting DOCX: {os.path.basename(path)}")
    doc = Document(path)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def extract_text_from_pptx(path: str) -> str:
    from pptx import Presentation
    print(f"📊 Extracting PPTX: {os.path.basename(path)}")
    prs = Presentation(path)
    text = ""
    for slide in prs.slides:
        for shape in slide.shapes:
            if hasattr(shape, "text"):
                text += shape.text + "\n"
    return text

# --------------------------------------------------
# EMBED
# --------------------------------------------------
def embed(text: str) -> list[float]:
    print("🧠 Embedding chunk...")
    return embeddings.embed_query(text)

# --------------------------------------------------
# INGEST
# --------------------------------------------------
def ingest():
    print("🚀 INGEST() STARTED")
    global collection

    # Clear and reset collection to handle potential dimension mismatch (Gemini=3072 vs Ollama=768)
    client = get_client()
    try:
        print(f"🗑️ Deleting collection {SUBJECT} to reset schema...")
        client.delete_collection(SUBJECT)
    except Exception as e:
        print(f"ℹ️ Collection {SUBJECT} didn't exist or couldn't be deleted: {e}")

    collection = get_collection(SUBJECT)
    print(f"📦 Collection {SUBJECT} re-initialized")

    doc_id = 0
    files_processed = 0
    chunks_added = 0
    batch_size = 50

    for file in os.listdir(DATA_PATH):
        ext = file.lower().split(".")[-1]
        if ext not in ["txt", "pdf", "docx", "pptx"]:
            continue

        unit = file.replace("unit", "").split(".")[0]
        files_processed += 1
        path = os.path.join(DATA_PATH, file)
        
        text = ""
        if ext == "txt":
            with open(path, "r", encoding="utf-8") as f:
                text = f.read().strip()
        elif ext == "pdf":
            text = extract_text_from_pdf(path).strip()
        elif ext == "docx":
            text = extract_text_from_docx(path).strip()
        elif ext == "pptx":
            text = extract_text_from_pptx(path).strip()

        if not text:
            continue

        chunks = splitter.split_text(text)
        
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            print(f"➕ Adding batch {i // batch_size + 1} ({len(batch)} chunks)")
            
            chunk_embeddings = embeddings.embed_documents(batch)
            
            collection.add(
                documents=batch,
                embeddings=chunk_embeddings,
                metadatas=[{
                    "subject": SUBJECT,
                    "unit": str(unit),
                    "source": file
                } for _ in range(len(batch))],
                ids=[f"{SUBJECT}_{doc_id + j}" for j in range(len(batch))]
            )
            doc_id += len(batch)
            chunks_added += len(batch)
            
            # Rate limit protection for Gemini Free Tier
            time.sleep(2) 

    print(f"✅ DONE | files={files_processed}, chunks={chunks_added}")
    print("📊 FINAL CHROMA COUNT:", collection.count())


if __name__ == "__main__":
    ingest()
