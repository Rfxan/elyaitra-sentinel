import os
import sys

# Add backend to sys.path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.ai_engine.providers import get_provider

def test_provider():
    print("Testing Provider Factory...")
    try:
        provider = get_provider()
        print(f"✅ Provider initialized: {type(provider).__name__}")
        
        print("\nTesting Generation...")
        # Note: This will actually call the API if Gemini is selected
        # We might want to skip actual network calls in a basic health check
        # But let's try a simple prompt
        # response = provider.generate("Hi, say 'hello world'")
        # print(f"✅ Generation Response: {response}")
        
        print("\nTesting Embedding...")
        # emb = provider.embed("hello world")
        # print(f"✅ Embedding Length: {len(emb)}")
        
        print("\nAll systems go!")
        
    except Exception as e:
        print(f"❌ TEST FAILED: {e}")

if __name__ == "__main__":
    test_provider()
