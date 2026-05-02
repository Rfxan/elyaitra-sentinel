# 📚 Elyaitra – Syllabus-Bound AI Study Assistant (Sentinel Integrated)

> **Elyaitra** is a state-of-the-art AI-powered study assistant designed specifically for students. It answers **strictly from the official syllabus**, preventing over-studying and irrelevant learning. 

This version comes integrated with **SentinelML**, an advanced adversarial-robust ML cybersecurity system that detects and blocks RAG-specific attacks (Prompt Injection, Reconnaissance, etc.) in real-time.

---

## ✨ Features

- 🎯 **Strictly Exam-Bound AI**: Restricted retrieval from preloaded syllabus data.
- ❗ **Clear “Not in Syllabus” Responses**: Direct feedback when topics are outside the scope.
- 🔍 **Fast Semantic Search**: High-performance RAG using Google Gemini & ChromaDB.
- 🛡️ **SentinelML Security Integration**:
  - **Real-time Threat Feed**: WebSocket-driven live ingestion with zero-latency updates.
  - **D3 Attack Topology**: Interactive force-directed graph of adversary relationships.
  - **AI Forensic Analysis**: Automated forensic narratives and MITRE mapping using LLMs.
  - **Deception Engine**: Adaptive honeypots (Static/Dynamic) for active threat mitigation.
  - **Telegram Push Alerts**: Immediate notifications for high-confidence intrusions.
  - **Forensic PDF Export**: Automated generation of professional incident reports.
  - **Attacker Fingerprinting**: Behavioral risk scoring and threat level classification.

---

## 🛠️ Combined Tech Stack

### Frontend
- **Framework**: React 18+ (Vite)
- **Styling**: Tailwind CSS
- **Visualization**: Recharts (Security Dashboard)

### Backend (Main)
- **Framework**: FastAPI (Python 3.10+)
- **AI Core**: Google Gemini API (Flash 2.0/2.5)
- **Vector DB**: ChromaDB
- **Logs**: Integrated Security Telemetry

### SentinelML Backend
- **Framework**: FastAPI
- **ML Engine**: Scikit-learn (RandomForest, Robust Scalers)
- **Security**: MITRE ATT&CK Mapping, Reputation Engine, Evasion Detection

---

## 🚀 Startup Instructions

To run the entire system, you need to start three distinct services. It is recommended to use three separate terminal windows.

### 1. SentinelML Security Backend (Port 8003)
SentinelML acts as the security guard for the entire application.

```bash
cd SentinelML-main/backend
# Setup environment
python -m venv venv
source venv/bin/activate  # Or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Run the security engine
uvicorn main:app --reload --host 0.0.0.0 --port 8003
```

### 2. Elyaitra Main Backend (Port 8001)
The primary RAG engine and API provider.

```bash
cd backend
# Setup environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure API Keys in .env
# Example: GEMINI_API_KEY=your_key_here

# Run the study assistant
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### 3. Elyaitra Frontend (Port 8080)
The web interface for students and the security dashboard.

```bash
cd frontend
# Install dependencies
npm install

# Run development server
npm run dev -- --port 8080
```

---

## 🧠 Configuration Details

### AI Provider Switching
Update `backend/.env` to switch between cloud and local providers:

```bash
# To use Gemini (Cloud):
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_key_here

# To use Ollama (Local):
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
```

### Security Telemetry
The main backend is pre-configured to forward suspicious traffic to SentinelML at `http://localhost:8003/ingest-event`. If an IP is flagged as malicious (3 strikes), SentinelML will signal Elyaitra to trigger a **Honeypot Response**, feeding the attacker deceptive "Declassified Research Notes" instead of actual syllabus data.

---

## 🛡️ Security Features Overview
- **RAG Injection Detection**: Blocks "ignore all instructions" and system prompt leakage attempts.
- **Enumeration Blocker**: Detects when a user tries to dump the entire knowledge base.
- **Model Integrity**: Checks MD5/SHA hashes of ML models to prevent tampering.
- **Visual SIEM**: Real-time traffic feed with MITRE technique mapping.

---

## 📸 Screenshots
<img width="2932" height="1472" alt="Study Assistant UI" src="https://github.com/user-attachments/assets/eb3ea318-cf2f-48da-b9b9-e7d6c95c40e9" />

*Integrated SentinelML Dashboard*
<img width="2930" height="1460" alt="Security Dashboard" src="https://github.com/user-attachments/assets/4e6aa5e9-9bef-40af-88ec-e7d5e8bb7f5f" />

---

## 📝 License
This project is for educational and hackathon purposes.
