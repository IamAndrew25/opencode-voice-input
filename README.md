# opencode-voice-input

Voice input for [opencode](https://opencode.ai) — speak instead of typing. Records audio from your microphone, transcribes it with Groq's Whisper API, and injects the text as your prompt.

## How it works

```
you speak → ffmpeg records → silence detected → Groq Whisper transcribes → opencode receives text as prompt
```

| File | Responsibility |
|---|---|
| `voz.ts` | Orchestrator: records audio + silence detection + calls transcribe |
| `groq-stt.ts` | Sends `.wav` to Groq API, returns transcribed text |
| `setup.sh` | Installs `/voz` command globally for opencode |

## Prerequisites

- **[Node.js](https://nodejs.org/)** v18+ (uses native `fetch`)
- **[tsx](https://tsx.is)** v4+ — runs TypeScript directly: `npm install -g tsx`
- **[ffmpeg](https://ffmpeg.org/)** — audio capture and processing
- **[opencode](https://opencode.ai)** — the TUI you're extending
- A free **[Groq API key](https://console.groq.com)**

## Quick start

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/opencode-voice-input.git
cd opencode-voice-input

# 2. Add your Groq API key
cp .env.example .env
# edit .env and paste your GROQ_API_KEY

# 3. Install the /voz command globally
./setup.sh

# 4. Use it
opencode
# type /voz and press Enter
# speak, wait 3 seconds of silence
# your words become the prompt
```

## Configuration

All settings live in `voz.ts`:

| Parameter | Default | Description |
|---|---|---|
| Audio device | `:0` | ffmpeg avfoundation device index |
| Silence threshold | `-35dB` | Audio below this = silence |
| Silence duration | `3s` | How long silence must last to stop |
| Min recording | `4s` | Ignore silence in first 4 seconds |

To find your audio device index:

```bash
ffmpeg -f avfoundation -list_devices true -i ""
```

## Verify your setup

Test transcription with an existing audio file:

```bash
tsx groq-stt.ts /path/to/audio.wav
```

Test the full recording flow:

```bash
tsx voz.ts
```

## Notes

- The `/voz` command uses opencode's `!` backtick template syntax to run `tsx voz.ts` and inject stdout as your prompt.
- `.env` is gitignored — your API key never leaves your machine.
- Temp audio file (`voz-temp.wav`) is created in your CWD and deleted after transcription.
- Groq's free tier has rate limits. If you hit them, wait a few seconds between calls.
