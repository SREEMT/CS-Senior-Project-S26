#!/bin/bash
cd "$(dirname "$0")"

# Start API bun server
echo "Starting API"
bun run server/src/index.js

# Start React frontend
echo "Starting frontend"
cd client/
bun run dev