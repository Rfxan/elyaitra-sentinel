import argparse
import requests
import numpy as np
import time
import random

# Continuous feature indices for NSL-KDD
CONTINUOUS_INDICES = [0, 4, 5, 9, 10, 11, 12, 13, 14, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]

def generate_base_features(attack=False):
    """Generate a realistic baseline feature vector (41 floats)."""
    features = [0.0] * 41
    if not attack:
        # Normal traffic: low duration, low bytes, low count
        features[0] = random.uniform(0, 100) / 1000.0 # duration
        features[4] = random.uniform(100, 500) # src_bytes
        features[5] = random.uniform(100, 500) # dst_bytes
        features[22] = random.uniform(1, 10) # count
    else:
        # Typical attack (e.g. Syn flood): high count, high rates
        features[0] = 0.0
        features[4] = 0.0
        features[5] = 0.0
        features[22] = random.uniform(100, 500) # count
        features[24] = 1.0 # serror_rate
    return features

def perturb_features(features, p_range=(0.1, 0.3)):
    """Add small perturbations to continuous features to evade detection."""
    new_features = features.copy()
    for idx in CONTINUOUS_INDICES:
        # Flip coin to perturb or not
        if random.random() > 0.5:
            delta = random.uniform(p_range[0], p_range[1])
            new_features[idx] += random.choice([-1, 1]) * delta
    return new_features

def run_attacker():
    parser = argparse.ArgumentParser(description="SentinelML Attack Simulator")
    parser.add_parser = argparse.Namespace()
    parser.add_argument("--mode", type=str, choices=["normal", "evasion", "poison", "blitz"], default="normal")
    parser.add_argument("--target", type=str, default="http://localhost:8000")
    parser.add_argument("--ip", type=str, default="192.168.1.101")
    args = parser.parse_args()

    target_url = args.target.rstrip("/")
    ip = args.ip
    
    print(f"[*] Targeting: {target_url} with mode: {args.mode} (IP: {ip})")

    if args.mode == "normal":
        features = generate_base_features(attack=False)
        resp = requests.post(f"{target_url}/predict", json={"features": features, "ip": ip})
        print(f"[+] Normal Response: {resp.json()}")

    elif args.mode == "evasion":
        # Start with an attack vector
        base_features = generate_base_features(attack=True)
        # Perturb to cross decision boundary
        evasion_features = perturb_features(base_features)
        resp = requests.post(f"{target_url}/predict", json={"features": evasion_features, "ip": ip})
        print(f"[+] Evasion Response: {resp.json()}")

    elif args.mode == "poison":
        # Attack features, but tell the model it is "normal" (label 0)
        attack_features = generate_base_features(attack=True)
        resp = requests.post(f"{target_url}/train", json={"features": attack_features, "label": 0, "ip": ip})
        print(f"[+] Poison Response: {resp.json()}")

    elif args.mode == "blitz":
        print(f"[*] Starting BLITZ attack...")
        attack_ips = [
            "45.12.23.8", "103.21.244.1", "181.65.23.9", "77.88.55.2",
            "8.8.8.8", "52.174.12.34", "13.233.12.1", "41.203.64.2"
        ]
        for i in range(20):
            mode = random.choice(["normal", "evasion", "poison"])
            lip = random.choice(attack_ips)
            print(f"    - Sending {mode} from {lip}")
            
            if mode == "normal":
                f = generate_base_features(False)
                requests.post(f"{target_url}/predict", json={"features": f, "ip": lip})
            elif mode == "evasion":
                f = perturb_features(generate_base_features(True))
                requests.post(f"{target_url}/predict", json={"features": f, "ip": lip})
            elif mode == "poison":
                f = generate_base_features(True)
                requests.post(f"{target_url}/train", json={"features": f, "label": 0, "ip": lip})
            
            time.sleep(0.5)
        print("[+] Blitz complete.")

if __name__ == "__main__":
    run_attacker()
