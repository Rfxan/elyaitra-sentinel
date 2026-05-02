# SentinelML Backend

SentinelML is an ML-driven cybersecurity backend designed for real-time intrusion detection, adversarial attack mitigation (evasion and poisoning), and automated IP blocking.

## Features
- **NSL-KDD Random Forest Classifier**: Binary classification (Normal vs. Attack).
- **Adversarial Detection**: 
  - **Evasion**: Z-score analysis (deviation > 3.5σ) to flag perturbed inputs.
  - **Poisoning**: High-confidence disagreement checks on training samples.
- **Auto IP Blocking**: 3 strikes system for adversarial or malicious behavior.
- **Geolocation Enrichment**: Integrated with `ip-api.com` for real-time threat mapping.
- **Simulation Suite**: CLI tool to simulate normal, evasion, and poisoning attacks.

## Setup & Run

### 1. Requirements
- Python 3.10+
- Virtual environment (recommended)

### 2. Installation
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Start Server
The server will automatically download the NSL-KDD dataset and train the model on its first run.
```bash
# From the /backend directory
./venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Run Attacker (Demo)
```bash
# Normal traffic
./venv/bin/python attacker.py --mode normal

# Evasion attack (perturbed features)
./venv/bin/python attacker.py --mode evasion

# Poisoning attack (flipped labels)
./venv/bin/python attacker.py --mode poison

# Rapid-fire blitz demo
./venv/bin/python attacker.py --mode blitz --target http://localhost:8000
```

## API Endpoints
- `POST /predict`: Classify traffic and check for evasion.
- `POST /train`: Submit new data for the training buffer (with poisoning protection).
- `GET /traffic-feed`: Last 500 security events.
- `GET /blocked-ips`: Current blocklist metadata.
- `POST /simulate`: Internal trigger for frontend demos.
- `GET /model-stats`: Operational metrics and uptime.
