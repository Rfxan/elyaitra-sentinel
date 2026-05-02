import argparse
import requests
import time
import random
import threading
import sys

STOP_BACKGROUND = False
BASE_URL = "http://localhost:8000" # default fallback


def background_normal_traffic(delay=0.5):
    """Continuously pumps normal traffic in the background so the dashboard looks alive."""
    while not STOP_BACKGROUND:
        try:
            requests.post(f"{BASE_URL}/simulate", json={"mode": "normal", "count": 1})
        except requests.exceptions.RequestException:
            pass
        time.sleep(delay)

def get_counts(intensity):
    if intensity == "easy":
        return {"straight": 3, "evasion": 2, "poison": 3, "ddos": 5}
    elif intensity == "normal":
        return {"straight": 5, "evasion": 5, "poison": 5, "ddos": 10}
    elif intensity == "hard":
        return {"straight": 10, "evasion": 15, "poison": 20, "ddos": 15}
    elif intensity == "brutal":
        return {"straight": 25, "evasion": 30, "poison": 40, "ddos": 40}
    else:
        return {"straight": 5, "evasion": 5, "poison": 5, "ddos": 10}

def run_tests():
    global STOP_BACKGROUND, BASE_URL
    
    parser = argparse.ArgumentParser(description="SENTINELML HACKATHON LIVE DEMO GENERATOR")
    parser.add_argument("--mode", type=str, choices=["all", "evasion", "poison", "ddos", "normal", "straight"], default="all", help="Attack mode to test")
    parser.add_argument("--intensity", type=str, choices=["easy", "normal", "hard", "brutal"], default="hard", help="Volume of attacks (easy, normal, hard, brutal)")
    parser.add_argument("--no-background", action="store_true", help="Disable continuous background normal traffic")
    parser.add_argument("--target", type=str, default="http://localhost:8000", help="Target URL of the SentinelML backend (e.g., http://192.168.1.10:8000)")
    
    args = parser.parse_args()
    
    # Update global base url based on args
    BASE_URL = args.target.rstrip('/')
    
    counts = get_counts(args.intensity)

    print("="*50)
    print("SENTINELML HACKATHON LIVE DEMO GENERATOR")
    print(f"[{args.intensity.upper()} INTENSITY]")
    print(f"[TARGET: {BASE_URL}]")
    print("="*50)

    print("\n[✔] Connecting & Resetting State...")
    try:
        requests.get(f"{BASE_URL}/health")
        requests.post(f"{BASE_URL}/reset")
    except requests.exceptions.ConnectionError:
        print("[!] Backend is down! Please start FastAPI server.")
        sys.exit(1)

    bg_thread = None
    if not args.no_background:
        print("[✔] Starting continuous background normal traffic stream...")
        # Adjust background speed based on intensity (brutal = very fast background noise)
        bg_delay = {"easy": 1.0, "normal": 0.5, "hard": 0.2, "brutal": 0.05}[args.intensity]
        bg_thread = threading.Thread(target=background_normal_traffic, args=(bg_delay,))
        bg_thread.daemon = True
        bg_thread.start()

    time.sleep(1) # Let background traffic populate the dashboard feed a bit

    if args.mode in ["all", "straight"]:
        print(f"\n[!] Generating {args.intensity.upper()} Straight Attacks ({counts['straight']} items)...")
        for _ in range(counts['straight']):
            requests.post(f"{BASE_URL}/predict", json={"features": [1.0]*41, "ip": f"100.0.0.{random.randint(1,250)}"})
            time.sleep(0.05)

    if args.mode in ["all", "evasion"]:
        print(f"\n[!] Triggering {args.intensity.upper()} AI Evasion Detectors ({counts['evasion']} items)...")
        for _ in range(counts['evasion']):
            requests.post(f"{BASE_URL}/simulate", json={"mode": "evasion", "count": 1})
            time.sleep(0.05)

    if args.mode in ["all", "poison"]:
        print(f"\n[!] Feeding {args.intensity.upper()} Poison Ingestion ({counts['poison']} items)...")
        for _ in range(counts['poison']):
            requests.post(f"{BASE_URL}/simulate", json={"mode": "poison", "count": 1})
            time.sleep(0.05)

    if args.mode in ["all", "ddos"]:
        print(f"\n[!] Executing {args.intensity.upper()} Blitz Attempt / DDoS ({counts['ddos']} items)...")
        requests.post(f"{BASE_URL}/simulate", json={"mode": "blitz", "count": counts['ddos']})
        
    print("\n[✔] Triggering Model Retrain on buffers...")
    requests.post(f"{BASE_URL}/retrain")

    time.sleep(1) # Let background traffic finish out some logs so the end looks organic

    if not args.no_background:
        STOP_BACKGROUND = True
        print("\n[✔] Stopping background normal traffic stream...")
        bg_thread.join()

    print("\n" + "="*50)
    print("DEMO PAYLOADS DELIVERED! CHECK YOUR DASHBOARDS!")
    print("="*50)

if __name__ == "__main__":
    run_tests()
