#!/bin/bash

pkill -f "uvicorn app.main" 2>/dev/null && echo "Backend stopped" || echo "Backend was not running"
pkill -f "node.*vite" 2>/dev/null && echo "Frontend stopped" || echo "Frontend was not running"
