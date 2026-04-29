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

# --------------------------------------------------
# PATHS
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(BASE_DIR)
BACKEND_DIR = os.path.dirname(APP_DIR)

DATA_PATH_BASE = os.path.join(BACKEND_DIR, "syllabus_data")

if not os.path.exists(DATA_PATH_BASE):
    raise RuntimeError(f"❌ syllabus_data not found at {DATA_PATH_BASE}")

# --------------------------------------------------
# SPLITTER
# --------------------------------------------------
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
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
# GET CHROMA COLLECTION
# --------------------------------------------------
collection = None

def ingest():
    print("🚀 GLOBAL INGEST STARTED")
    global collection
    client = get_client()

    # Iterate through all subject folders in syllabus_data
    subjects = [d for d in os.listdir(DATA_PATH_BASE) if os.path.isdir(os.path.join(DATA_PATH_BASE, d))]
    
    if not subjects:
        print("⚠️ No subject folders found in syllabus_data!")
        return

    for subject in subjects:
        print(f"\n📚 Processing Subject: {subject.upper()}")
        subject_path = os.path.join(DATA_PATH_BASE, subject)
        
        # Clear and reset collection for this specific subject
        try:
            print(f"🗑️ Deleting collection {subject} to reset schema...")
            client.delete_collection(subject)
        except Exception as e:
            print(f"ℹ️ Collection {subject} didn't exist: {e}")

        collection = get_collection(subject)
        
        doc_id = 0
        files_processed = 0
        chunks_added = 0
        batch_size = 50

        for file in os.listdir(subject_path):
            ext = file.lower().split(".")[-1]
            if ext not in ["txt", "pdf", "docx", "pptx"]:
                continue

            unit = file.replace("unit", "").split(".")[0]
            files_processed += 1
            path = os.path.join(subject_path, file)
            
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
                print(f"➕ [{subject}] Adding batch {i // batch_size + 1} ({len(batch)} chunks)")
                
                chunk_embeddings = embeddings.embed_documents(batch)
                
                collection.add(
                    documents=batch,
                    embeddings=chunk_embeddings,
                    metadatas=[{
                        "subject": subject,
                        "unit": str(unit),
                        "source": file
                    } for _ in range(len(batch))],
                    ids=[f"{subject}_{doc_id + j}" for j in range(len(batch))]
                )
                doc_id += len(batch)
                chunks_added += len(batch)
                
                # Rate limit protection
                time.sleep(1) 

        print(f"✅ DONE {subject} | files={files_processed}, chunks={chunks_added}")
    print("📊 FINAL CHROMA COUNT:", collection.count())


if __name__ == "__main__":
    ingest()
