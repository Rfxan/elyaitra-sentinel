# SentinelML

An adversarially robust ML cybersecurity system. 
Detects evasion attempts, dataset poisoning, and standard ML attacks in real-time. Features a resilient Scikit-learn RandomForest model and a dynamically-updating React/Vite dashboard.

## Architecture
- **Backend:** FastAPI, Scikit-learn, Uvicorn, Python
- **Frontend:** React, TailwindCSS, Recharts, Vite

## Startup Instructions

### 1. Backend

Open a terminal and run the backend:

```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*Note: The backend runs perfectly standalone and uses synthetically generated traffic if no dataset is provided.*

### 2. Frontend

Open another terminal and run the frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm dev
```

*Note: Access the dashboard via your browser. (The framework is powered by Vite)*

## Features

- **Real-Time Threat Intelligence:** Traffic feed poll matching dynamic metrics.
- **Model Health Matrix:** Real-time visibility into overall ML metrics and accuracy. 
- **Active Adversary Blocker:** Track and autoblock 3-strike threat-actor patterns.
- **Poisoning & Evasion:** Specifically detect ML perturbation attacks rather than just broad heuristics.

---

### Simulator Helper
Once the backend is running, you can throw a simulator payload against it:
```bash
curl -X POST http://localhost:8000/simulate \
  -H 'Content-Type: application/json' \
  -d '{"mode": "blitz", "count": 20}'
```
