# Proyecto Voz en opencode — Estado FINAL ✅ (2026-07-29)

## Objetivo ✅
Voz en opencode: hablar, transcripción con Groq (Whisper hosteado), inyectar en prompt.
Mac M5, Node+tsx, ffmpeg 8.1.2, opencode.
**Funciona desde cualquier directorio.**

## Stack final
- **STT**: Groq Whisper large-v3-turbo (API cloud, free tier)
- **Runtime**: Node v26.3.1 + tsx v4.23.1
- **Audio**: ffmpeg 8.1.2, avfoundation, device **`:0`** (MX Brio webcam mic)
- **Repositorio**: /Users/andrew/ProyectosPersonales/Whisper

## Archivos del proyecto

| Archivo | Rol |
|---|---|
| `.env` | GROQ_API_KEY |
| `groq-stt.ts` | Función: manda .wav a Groq, devuelve texto |
| `test-groq-stt.ts` | Test standalone |
| `voz.ts` | Orquestador: graba + silencio detect + transcribe |
| `contexto-problema-actual.md` | Este archivo |
| `package.json` | Sin dependencias |

## Archivos de opencode

| Archivo | Rol |
|---|---|
| `~/.config/opencode/commands/voz.md` | Command `/voz` global |
| `Whisper/.opencode/commands/voz.md` | Idem local |

## Bugs encontrados y resueltos

1. **`$SHELL_OUTPUT` no existe** como variable en templates de opencode. Las únicas variables son `$1`, `$2`, `$ARGUMENTS`. Para inyectar shell output se usa `!`command``.

2. **`import.meta.main` es `undefined`** en tsx v4.23.1. Reemplazado con `isMainModule()` que usa `realpathSync` para comparar paths.

3. **Micrófono `:1` no capta audio** (MacBook Pro Microphone). El que funciona es `:0` (MX Brio webcam mic). El `:1` graba 274KB de silencio absoluto (-91dB).

4. **`dotenv` buscaba `.env` en CWD**. Reemplazado con manual loader silencioso que usa `__dirname` absoluto via `import.meta.url`.

## Parámetros actuales de voz.ts

| Parámetro | Valor |
|---|---|
| Device | `:0` (MX Brio) |
| Silencio detect | `n=-35dB` |
| Tiempo silencio | `d=3` segundos |
| Mínimo grabación | 4 segundos |

## Uso
```bash
# En terminal para testear
cd /tmp && rm -f voz-temp.wav && tsx /Users/andrew/ProyectosPersonales/Whisper/voz.ts

# En opencode TUI
opencode
/voz
```
