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

# 2. Install dependencies (declares dotenv + tsx locally)
npm install

# 3. Add your Groq API key
cp .env.example .env
# edit .env and paste your GROQ_API_KEY

# 4. Install the /voz command globally in opencode
./setup.sh
# setup.sh runs a preflight check: if node v18+, tsx, ffmpeg, opencode,
# or a valid .env is missing, it tells you exactly what to install and aborts.

# 5. Use it
opencode
# type /voz and press Enter
# speak, wait 5 seconds of silence
# your words become the prompt
```

## Configuration

All settings live in `voz.ts`:

| Parameter | Default | Description |
|---|---|---|
| Audio device | `:0` | ffmpeg avfoundation audio device index |
| Silence threshold | `-40dB` | Audio below this = silence |
| Silence duration | `5s` | How long silence must last to stop recording |

To find your audio device index (macOS only):

```bash
ffmpeg -f avfoundation -list_devices true -i ""
```

> The first audio input is `:0`. On macOS this index may map to a different
> physical device on each machine (Bluetooth headset, USB mic, built-in mic).
> If recording fails or captures the wrong device, list the devices and change
> the `-i ":0"` argument to the matching index in `voz.ts`.

## Verify your setup

Test transcription with an existing audio file:

```bash
tsx groq-stt.ts /path/to/audio.wav
```

Test the full recording flow:

```bash
tsx voz.ts
```

## Run the test suite

A real `npm test` is bundled. It transcribes the committed `voz.wav` fixture
through the Groq API and checks that the result is non-empty and not the
placeholder. It needs `GROQ_API_KEY` in your `.env`.

```bash
npm test
```

What it validates (and guards against regressions):
- `groq-stt.ts` reaches the Groq API and parses the response
- The committed `voz.wav` fixture produces non-empty Spanish text
- The transcript matches the expected string (`temperature=0` keeps it stable)

## Notes

- The `/voz` command uses opencode's `!` backtick template syntax to run `tsx voz.ts` and inject stdout as your prompt.
- `.env` is gitignored — your API key never leaves your machine.
- Temp audio file (`voz-temp.wav`) is created in your CWD and deleted after transcription.
- Groq's free tier has rate limits. If you hit them, wait a few seconds between calls.
