from app.ai_engine.retriever import retrieve_chunks

if __name__ == "__main__":
    subject = "chemistry"
    question = "Define sensors"
    chunks = retrieve_chunks(question, subject)

    print("\n--- RETRIEVED CHUNKS ---\n")
    if not chunks:
        print("❌ No chunks retrieved")
    else:
        for i, c in enumerate(chunks, 1):
            print(f"[{i}] {c[:300]}\n")
