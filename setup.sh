#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
COMMANDS_DIR="$HOME/.config/opencode/commands"
COMMAND_FILE="$COMMANDS_DIR/voz.md"

echo "Installing /voz command for opencode..."
echo "Repo path: $REPO_DIR"

mkdir -p "$COMMANDS_DIR"

cat > "$COMMAND_FILE" << EOF
---
description: Record your voice, transcribe with Groq Whisper, send as prompt
agent: build
---

!\`tsx $REPO_DIR/voz.ts\`
EOF

chmod +x "$REPO_DIR/setup.sh"

echo ""
echo "Done. /voz is now available globally in opencode."
echo "Run 'opencode' from any directory, type /voz, and speak."
