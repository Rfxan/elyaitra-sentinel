from app.ai_engine.chroma_client import client

if __name__ == "__main__":
    print("\n📦 Collections in Chroma:\n")

    collections = client.list_collections()
    if not collections:
        print("❌ No collections found")
    else:
        for c in collections:
            print(f"- {c.name}")

    print("\n📊 Collection document counts:\n")
    for c in collections:
        col = client.get_collection(c.name)
        print(f"{c.name}: {col.count()} documents")
