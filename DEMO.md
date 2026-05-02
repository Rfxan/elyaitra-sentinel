# Elyaitra Sentinel — Production Hardening & Demo Guide

## System Overview
Elyaitra Sentinel is a high-fidelity AI security platform designed to detect, deceive, and defend against adversarial LLM attacks.

### Key Features Implemented:
- **Real-time Threat Feed**: WebSocket-based ingestion from SentinelML backend.
- **AI Forensic Analysis**: Deep session correlation with MITRE TTP mapping and forensic narratives.
- **Adversarial Topology**: D3.js force-directed graph visualizing attack relationships.
- **Deception Engine**: Dynamic honeypot generation using the LLM Provider Factory.
- **Telegram Alerting**: Instant push notifications for high-confidence intrusions.
- **Automated Reporting**: Professional PDF incident exports for security audits.

## Running the Demo
1. **Initialize System**: Click "Execute Simulation" in the Topbar to seed 30 realistic attack events.
2. **Explore Dashboard**: View the Attack Topology Graph and Top Adversaries.
3. **Forensic Deep Dive**: Navigate to "Forensics", select a session, and click "Deep AI Analysis" for an LLM-generated narrative.
4. **Live Feed**: Open "Threat Feed" and press `Ctrl+K` to search for specific IPs.
5. **PDF Export**: Generate a forensic report from the Forensics view.

## Environment Setup
Ensure the following are set in your `.env`:
- `LLM_PROVIDER`: (e.g., `openrouter`, `groq`, `ollama`)
- `OPENROUTER_API_KEY`: Your key
- `TELEGRAM_BOT_TOKEN`: Bot token for alerts
- `TELEGRAM_CHAT_ID`: Destination chat ID
- `HONEYPOT_MODE`: `dynamic` for AI-generated deception.

## Keyboard Shortcuts
- `G` then `D`: Dashboard
- `G` then `T`: Threat Feed
- `G` then `F`: Forensics
- `Ctrl + K`: Global IP Search

---
*Built for the AI Security Hackathon 2026*
