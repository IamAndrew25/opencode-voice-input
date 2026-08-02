---
description: Record your voice, transcribe with Groq Whisper, send as prompt
agent: build
---

This is a reference copy of the command installed globally by `./setup.sh`.

The `/voz` command actually used by opencode lives at:
  ~/.config/opencode/commands/voz.md

`setup.sh` writes the absolute path to `voz.ts` into that file at install time,
so this in-repo copy is only for documentation. To install it:

```bash
./setup.sh
```

The command body that gets installed is:

!`tsx <REPO_DIR>/voz.ts`
