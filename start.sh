#!/usr/bin/env bash

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

PIDS=""

cleanup() {
  echo ""
  echo "Stopping services..."
  for p in $PIDS; do
    kill "$p" 2>/dev/null
  done
  wait 2>/dev/null
  exit 0
}
trap cleanup INT TERM

echo "==> Starting mock-gateways (5100/5101)"
(cd "$ROOT/mock-gateways" && npm run dev) &
PIDS="$PIDS $!"

if [ -x "$ROOT/ml-service/.venv/bin/uvicorn" ]; then
  echo "==> Starting ML service (8000)"
  (cd "$ROOT/ml-service" && "$ROOT/ml-service/.venv/bin/uvicorn" app:app --host 0.0.0.0 --port 8000) &
  PIDS="$PIDS $!"
else
  echo "==> Skipping ML service (no venv). Run setup.sh to enable."
fi

echo "==> Starting frontend (3000)"
(cd "$ROOT/frontend" && npm run dev) &
PIDS="$PIDS $!"

echo ""
echo "Services starting. Frontend: http://localhost:3000  Mock: 5100/5101  ML: 8000"
echo "Press Ctrl+C to stop all."
wait