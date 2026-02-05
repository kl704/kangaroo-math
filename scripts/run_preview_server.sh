#!/usr/bin/env bash
set -euo pipefail

PORT=${PORT:-8000}
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "Serving from $ROOT_DIR on http://localhost:$PORT"
python3 -m http.server "$PORT" --directory "$ROOT_DIR/public" &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"
trap 'kill $SERVER_PID' EXIT
wait $SERVER_PID
