# Farmyza

Crop-rotation decision-support platform for Bangladeshi farmers. Next.js 14 full-stack (frontend + API routes) with a Python ML inference service (BiLSTM climate forecast + crop recommendation) and a mock Google OAuth gateway for local development.

## Prerequisites

- **Node.js** >= 18 (https://nodejs.org)
- **Python 3.11** (for the ML service; TensorFlow wheels). Optional but recommended — the app degrades gracefully without it.
- `git`

## Quick start

```bash
git clone <repo-url> farmyza
cd farmyza
npm run setup      # installs deps, creates venv, copies .env
npm run dev        # starts mock-gateways (5100/5101), ML service (8000), frontend (3000)
```

Then open http://localhost:3000 and sign in with Google (mock).

## Manual setup (if you prefer)

```bash
# 1. Frontend
cd frontend
npm install
cp .env.example .env.local   # edit if needed

# 2. Mock gateways
cd ../mock-gateways
npm install

# 3. ML service (optional, requires Python 3.11)
cd ../ml-service
python3.11 -m venv .venv
.venv/bin/pip install -r requirements.txt

# 4. Run (three terminals)
cd ../mock-gateways && npm run dev          # 5100 / 5101
cd ../ml-service && .venv/bin/uvicorn app:app --port 8000
cd ../frontend && npm run dev                 # 3000
```

## Services

| Service | Port | Notes |
|---|---|---|
| Frontend (Next.js) | 3000 | Main app + API routes |
| Mock Google OAuth | 5100 | Fake consent screen |
| Mock payments | 5101 | bKash / SSLCommerz (unused in v1) |
| ML inference (FastAPI) | 8000 | BiLSTM model + scaler; optional |

## Environment

`frontend/.env.local` is created from `frontend/.env.example` by setup. Defaults point at the local mock services; change `ML_SERVICE_URL` if the ML service runs elsewhere.

## Tests

```bash
cd frontend && npm test        # 3 rule-engine regression tests
cd frontend && npm run build    # production build
```

## Project layout

```
frontend/        Next.js 14 app (UI + API routes + SQLite)
mock-gateways/   Mock Google OAuth + payment gateways
ml-service/      Python FastAPI inference service (BiLSTM)
AGENTS/          Harness (gitignored)
AGENT.md         Agent rules (gitignored)
```

## Notes

- `frontend/farmyza.db` is created on first run (SQLite). Schema + seed users are initialized automatically.
- Model files (`nasa_bilstm_weather_model.h5`, `weather_scaler.pkl`) are tracked in the repo.
- `AGENT.md` and `AGENTS/` are gitignored (per project convention).