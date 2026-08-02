#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
COMMANDS_DIR="$HOME/.config/opencode/commands"
COMMAND_FILE="$COMMANDS_DIR/voz.md"

echo "Installing /voz command for opencode..."
echo "Repo path: $REPO_DIR"
echo ""

# --- Preflight: chequear dependencias antes de romper en runtime ---
MISSING=0

check_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "  ✗ Missing: $1"
    MISSING=1
  fi
}

check_node_version() {
  if command -v node >/dev/null 2>&1; then
    NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
    if [ "$NODE_MAJOR" -lt 18 ]; then
      echo "  ✗ Node.js v18+ required (found v$(node --version))"
      MISSING=1
    fi
  fi
}

echo "Checking prerequisites..."
check_cmd node
check_node_version
check_cmd tsx
check_cmd ffmpeg
check_cmd opencode

if [ ! -f "$REPO_DIR/.env" ]; then
  echo "  ✗ Missing: .env file (copy .env.example to .env and set GROQ_API_KEY)"
  MISSING=1
elif ! grep -q "^GROQ_API_KEY=" "$REPO_DIR/.env" 2>/dev/null; then
  echo "  ✗ Missing: GROQ_API_KEY not set in .env"
  MISSING=1
else
  # Verifica que no sea el valor placeholder del example
  KEY_VALUE=$(grep "^GROQ_API_KEY=" "$REPO_DIR/.env" | cut -d= -f2-)
  if [ "$KEY_VALUE" = "your_groq_api_key_here" ] || [ -z "$KEY_VALUE" ]; then
    echo "  ✗ GROQ_API_KEY in .env is still the placeholder — set your real key"
    MISSING=1
  fi
fi

if [ "$MISSING" -ne 0 ]; then
  echo ""
  echo "Prerequisites check failed. Fix the missing items above and re-run ./setup.sh"
  echo ""
  echo "  Install:"
  echo "    node:  https://nodejs.org/  (or: brew install node)"
  echo "    tsx:   npm install -g tsx   (or run: npm install)"
  echo "    ffmpeg: brew install ffmpeg"
  echo "    opencode: https://opencode.ai"
  echo "    .env:  cp .env.example .env  && edit GROQ_API_KEY"
  exit 1
fi

echo "  ✓ All prerequisites present"
echo ""

# --- Instalar deps locales (tsx/dotenv) ---
if [ -f "$REPO_DIR/package.json" ]; then
  echo "Installing npm dependencies..."
  (cd "$REPO_DIR" && npm install --silent)
  echo ""
fi

# --- Instalar el command /voz global ---
mkdir -p "$COMMANDS_DIR"

cat > "$COMMAND_FILE" << EOF
---
description: Record your voice, transcribe with Groq Whisper, send as prompt
agent: build
---

!\`tsx $REPO_DIR/voz.ts\`
EOF

echo "Done. /voz is now available globally in opencode."
echo "Run 'opencode' from any directory, type /voz, and speak."
