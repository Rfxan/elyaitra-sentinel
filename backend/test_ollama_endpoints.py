import requests

base_url = "http://localhost:11434"
models = ["llama3.1:8b", "nomic-embed-text:latest", "nomic-embed-text"]
endpoints = ["/api/embed", "/api/embeddings", "/api/generate"]

for endpoint in endpoints:
    print(f"\n--- Testing Endpoint: {endpoint} ---")
    for model in models:
        url = f"{base_url}{endpoint}"
        if endpoint == "/api/embed":
            payload = {"model": model, "input": ["hello"]}
        elif endpoint == "/api/embeddings":
            payload = {"model": model, "prompt": "hello"}
        else:
            payload = {"model": model, "prompt": "hello", "stream": False}
        
        try:
            response = requests.post(url, json=payload, timeout=5)
            print(f"Model: {model:25} | Status: {response.status_code}")
            if response.status_code == 200:
                print(f"✅ Success! Response keys: {list(response.json().keys())}")
            else:
                print(f"❌ Error: {response.text[:100]}")
        except Exception as e:
            print(f"Model: {model:25} | Error: {e}")
