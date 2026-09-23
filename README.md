# opencode-voice-input

Voice input for [opencode](https://opencode.ai): speak instead of typing. The project records audio from your microphone, transcribes it with Groq Whisper, and sends the text to OpenCode as your prompt.

## How It Works

```text
You speak -> ffmpeg records -> silence is detected -> Groq Whisper transcribes -> OpenCode receives the text as a prompt
```

| File | Responsibility |
|---|---|
| `voz.ts` | Records audio, detects silence, and calls transcription |
| `groq-stt.ts` | Sends a `.wav` file to the Groq API and returns its transcript |
| `setup.sh` | Installs the global `/voz` command for OpenCode |

## Prerequisites

- **[Node.js](https://nodejs.org/)** v18+ for native `fetch`
- **[tsx](https://tsx.is)** v4+ to run TypeScript directly
- **[ffmpeg](https://ffmpeg.org/)** for microphone capture and audio processing
- **[OpenCode](https://opencode.ai)** as the target TUI
- A free **[Groq API key](https://console.groq.com)**

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/IamAndrew25/opencode-voice-input.git
cd opencode-voice-input

# 2. Install local dependencies
npm install

# 3. Install tsx globally.
# setup.sh and the global /voz command require it to be available in PATH.
npm install -g tsx

# 4. Add your Groq API key
cp .env.example .env
# Edit .env and set GROQ_API_KEY

# 5. Install the /voz command globally in OpenCode
./setup.sh

# 6. Start OpenCode
opencode

# Type /voz, press Enter, speak, then stay silent for 3 seconds.
# Your speech becomes the prompt.
```

`setup.sh` checks for Node.js v18+, `tsx`, `ffmpeg`, OpenCode, and a valid `GROQ_API_KEY` before installing the command.

## Configuration

Recording settings live in `voz.ts`:

| Parameter | Default | Description |
|---|---:|---|
| Audio device | `:0` | ffmpeg avfoundation audio device index |
| Silence threshold | `-35dB` | Audio below this level is considered silence |
| Silence duration | `3s` | Silence required to stop recording |
| Minimum recording | `4s` | Silence detection starts after this time |

To list audio devices on macOS:

```bash
ffmpeg -f avfoundation -list_devices true -i ""
```

> On macOS, `:0` can represent a different physical device on each computer. If recording fails or uses the wrong microphone, list the devices and update the `-i ":0"` value in `voz.ts`.

## Verify Your Setup

Test transcription with an existing audio file:

```bash
tsx groq-stt.ts /path/to/audio.wav
```

Test the full microphone recording flow:

```bash
tsx voz.ts
```

## Run the Test Suite

`npm test` transcribes the included `voz.wav` fixture through Groq and validates the result. It requires a valid `GROQ_API_KEY` in `.env`.

```bash
npm test
```

The test verifies that:

- `groq-stt.ts` reaches the Groq API and parses its response.
- The committed `voz.wav` fixture produces a non-empty Spanish transcript.
- The transcript matches the expected output with `temperature=0`.

## Notes

- The `/voz` command executes `tsx voz.ts` and sends its standard output to OpenCode as the prompt.
- `.env` is ignored by Git, so your API key is not committed.
- `voz-temp.wav` is created in the current directory and deleted after transcription.
- Groq free-tier rate limits may require waiting briefly between requests.
