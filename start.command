#!/bin/bash
cd "$(dirname "$0")"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
echo "Tank Girl OS server starting..."
# Kill any previous instance on port 3001
lsof -ti:3001 | xargs kill -9 2>/dev/null
node server.js
