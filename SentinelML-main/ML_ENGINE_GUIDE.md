# SentinelML: AI/ML Engine Guide

Welcome! This guide outlines how to work on the SentinelML detection engine. The backend is built with **FastAPI**, **Scikit-learn**, and **Uvicorn**.

## Core Logic Components
- `backend/model.py`: **MLModel Class**. Currently uses a RandomForest for binary classification (Attack vs. Normal).
- `backend/defender.py`: **Defender Class**. Handles adversarial attack detection (Evasion & Poisoning).
- `backend/blocker.py`: **Blocker Class**. IP Strike system (3-strikes rule).

## Project Structure
- `backend/data/`: Placeholder for datasets and model artifacts.
- `backend/simulator.py`: Logic for generating synthetic traffic for demo/testing.
- `backend/requirements.txt`: Python package list.

## Data Flow
- All requests come into `backend/main.py`.
- **Predictions**: `main.py` -> `Defender.detect_evasion` -> `MLModel.predict`.
- **Training**: `main.py` -> `Defender.detect_poisoning` -> `MLModel.train`.
- **Actions**: If an attack is caught, the `Blocker` record_strike logic is triggered.

## Getting Started
1. **Setup Env**: `cp .env.example .env` (Set `ALLOWED_ORIGINS` to include your frontend URL).
2. **Setup Venv**: `python -m venv venv && source venv/bin/activate` 
3. **Install**: `pip install -r requirements.txt`
4. **Run**: `uvicorn main:app --reload`

## Immediate Tasks
1. **Improve Detection Logic**:
    - The current `Defender` uses Z-scores and confidence thresholds. 
    - You can implement more sophisticated adversarial robust ML techniques (e.g., adversarial training, anomaly detection).
2. **Dataset Integration**:
    - Replace synthetic data in `_generate_synthetic_and_train()` with real security datasets (e.g., NSL-KDD, CIC-IDS2017).
3. **Model Artifact Management**: 
    - The code saves/loads a local `model.pkl`. Consider adding more metadata for tracking.

## Development with VibeCode
- **Context is King**: Point VibeCode to `backend/main.py` to see how the ML classes are called.
- **Unit Testing**: You can add a `tests/` directory for model performance tracking.

---
**Note**: The backend provides a `/simulate` endpoint for demo purposes. Check `main.py` for usage.
