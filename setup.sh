#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "==> Farmyza setup"

# --- Node checks ---
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is required (>=18). Install from https://nodejs.org" >&2
  exit 1
fi
echo "Node: $(node --version)"

# --- Python 3.11 check (needed for ML service / TensorFlow) ---
PYTHON=""
for c in python3.11 python3; do
  if command -v "$c" >/dev/null 2>&1; then
    v=$("$c" --version 2>&1)
    if echo "$v" | grep -q "3.11"; then PYTHON="$c"; break; fi
  fi
done
if [ -z "$PYTHON" ]; then
  echo "WARNING: Python 3.11 not found. ML service will not be set up." >&2
  echo "         Install Python 3.11 and re-run setup.sh to enable ML features." >&2
fi

# --- Frontend ---
echo "==> Installing frontend dependencies"
cd "$ROOT/frontend"
npm install
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "   created frontend/.env.local from .env.example"
fi

# --- Mock gateways ---
echo "==> Installing mock-gateways dependencies"
cd "$ROOT/mock-gateways"
npm install

# --- ML service ---
if [ -n "$PYTHON" ]; then
  echo "==> Setting up ML service (Python venv + deps)"
  cd "$ROOT/ml-service"
  if [ ! -d .venv ]; then
    $PYTHON -m venv .venv
  fi
  .venv/bin/pip install --upgrade pip >/dev/null
  .venv/bin/pip install -r requirements.txt
fi

cd "$ROOT"
echo ""
echo "==> Setup complete."
echo "    Run 'npm run dev' (or 'bash start.sh') to start all services."