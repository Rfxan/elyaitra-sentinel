import os
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from backend.app.ai_engine.chroma_client import get_collection
from backend.app.ai_engine.providers import get_provider
from pathlib import Path

# --------------------------------------------------
# ENV
# --------------------------------------------------
dotenv_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=dotenv_path)

# --------------------------------------------------
# LLM PROVIDER
# --------------------------------------------------
provider = get_provider()

# --------------------------------------------------
# PATHS
# --------------------------------------------------
PROJECT_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )
)

SYLLABUS_PATH = os.path.join(PROJECT_ROOT, "syllabus_data")

print("📁 Using syllabus path:", SYLLABUS_PATH)

# --------------------------------------------------
# TEXT SPLITTER
# --------------------------------------------------
splitter = RecursiveCharacterTextSplitter(
    chunk_size=300,
    chunk_overlap=50
)

# --------------------------------------------------
# INGESTION CONFIG
# --------------------------------------------------
EMBED_BATCH_SIZE = 20   # SAFE size for Gemini

# --------------------------------------------------
# INGESTION LOGIC
# --------------------------------------------------
def ingest():
    total_chunks = 0

    for subject in os.listdir(SYLLABUS_PATH):
        subject_path = os.path.join(SYLLABUS_PATH, subject)

        if not os.path.isdir(subject_path):
            continue

        subject = subject.lower().strip()
        print(f"\n[+] Ingesting subject: {subject}")
        print("    📄 Files found:", os.listdir(subject_path))

        collection = get_collection(subject)
        doc_id = 0
        files_processed = 0

        for file in os.listdir(subject_path):
            if not file.lower().endswith(".txt"):
                continue

            files_processed += 1
            print("    📄 Reading:", file)

            file_path = os.path.join(subject_path, file)
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read().strip()

            if not text:
                print("    ⚠️ Empty file:", file)
                continue

            # -------- SPLIT INTO CHUNKS --------
            unit = file.replace("unit", "").replace(".txt", "")
            chunks = splitter.split_text(text)
            print(f"        🔹 {len(chunks)} chunks extracted")

            # -------- SAFE BATCH EMBEDDING --------
            for start in range(0, len(chunks), EMBED_BATCH_SIZE):
                batch = chunks[start:start + EMBED_BATCH_SIZE]
                batch_num = (start // EMBED_BATCH_SIZE) + 1
                total_batches = ((len(chunks) - 1) // EMBED_BATCH_SIZE) + 1

                print(
                    f"        ⏳ Embedding batch {batch_num}/{total_batches} "
                    f"({len(batch)} chunks)"
                )

                embeddings = provider.embed_batch(batch)

                collection.add(
                    documents=batch,
                    embeddings=embeddings,
                    metadatas=[{
                        "subject": subject,
                        "unit": unit,
                        "source": file
                    } for _ in range(len(batch))],
                    ids=[f"{subject}_{doc_id + i}" for i in range(len(batch))]
                )

                doc_id += len(batch)
                total_chunks += len(batch)

            print(f"        ✅ Finished embedding {file}")

        print(f"[✓] Done {subject} | files={files_processed}, chunks={doc_id}")

    print(f"\n✅ Ingestion complete | total chunks indexed = {total_chunks}")

# --------------------------------------------------
if __name__ == "__main__":
    ingest()
