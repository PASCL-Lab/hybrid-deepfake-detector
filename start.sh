#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_LOG="/tmp/deepfake-backend.log"
FRONTEND_LOG="/tmp/deepfake-frontend.log"

# Get public IP for display
PUBLIC_IP=$(curl -s --max-time 3 https://ipinfo.io/ip 2>/dev/null || hostname -I | awk '{print $1}')

echo "=== Deepfake Detector ==="

# Kill any existing instances
pkill -f "uvicorn app.main" 2>/dev/null && echo "Stopped existing backend" || true
pkill -f "vite.*deepfake" 2>/dev/null && sleep 1 || true

# Start backend
echo "Starting backend..."
cd "$BACKEND_DIR"
nohup venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend..."
cd "$FRONTEND_DIR"
nohup npm run dev -- --host 0.0.0.0 > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

# Wait for backend (models take ~30s to load)
echo "Waiting for models to load..."
for i in $(seq 1 60); do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Check results
BACKEND_OK=false
FRONTEND_OK=false

curl -s http://localhost:8000/health > /dev/null 2>&1 && BACKEND_OK=true
curl -s http://localhost:3000 > /dev/null 2>&1 && FRONTEND_OK=true

echo ""
echo "=== Status ==="
$BACKEND_OK  && echo "Backend  ✓  http://$PUBLIC_IP:8000" || echo "Backend  ✗  (check $BACKEND_LOG)"
$FRONTEND_OK && echo "Frontend ✓  http://$PUBLIC_IP:3000" || echo "Frontend ✗  (check $FRONTEND_LOG)"
echo ""
echo "Logs:"
echo "  tail -f $BACKEND_LOG"
echo "  tail -f $FRONTEND_LOG"
echo ""
echo "Stop: kill $BACKEND_PID $FRONTEND_PID"
