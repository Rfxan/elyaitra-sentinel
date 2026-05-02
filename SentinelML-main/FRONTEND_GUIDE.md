# SentinelML: Frontend Developer Guide

Welcome! This guide outlines how to work on the SentinelML React dashboard. The frontend is built with **React (Vite)**, **TailwindCSS**, and **Recharts**.

## Project Structure
- `src/components/`: Modular UI units (Gauges, Timelines, etc.).
- `src/hooks/`: Data fetching and state management.
- `src/index.css`: Global Tailwind directives and custom animations.
- `.env.example`: Template for environment variables.

## Getting Started
1. **Setup Env**: `cp .env.example .env`
2. **Install**: `npm install`
3. **Run**: `npm dev`

## API Consumption Details
The frontend primarily uses the `useTrafficPolling` hook to sync with the backend.

### Polled Endpoints
- **GET** `/traffic-feed`: Latest events (Evasion, Attack, Normal).
- **GET** `/model-stats`: Real-time metric updates (Accuracy, Counts).
- **GET** `/blocked-ips`: Current list of active adversary blocks.

### Action Endpoints (To be used for new features)
- **POST** `/predict`: Test a specific feature vector.
- **POST** `/train`: Manually submit training data.
- **POST** `/block-ip`: Manually block a suspicious IP.
- **DELETE** `/block-ip/{ip}`: Unblock an IP via the UI.

## UI Components to Improve
1. **ThreatGauge.jsx**: Currently shows a simple metric. Could be expanded to show more detailed risk scores.
2. **AttackTimeline.jsx**: Displays the history of events.
3. **BlockList.jsx**: Interface for managing active blocks.

## Development with VibeCode
- **Context is King**: Always point VibeCode to `src/hooks/useTrafficPolling.js` so it understands where the data comes from.
- **Styling**: We use utility-first Tailwind. For complex animations, check `index.css`.
- **Mocking**: If the backend is down, use the `isLive` state to show "Offline" mode.

---
**Note**: The backend runs on `localhost:8000` by default. Ensure your `.env` reflects this.
