// voz.ts
// Orquestador: graba audio del microfono y lo transcribe con Groq.
// Un solo punto de entrada para el command /voz de opencode.
// Uso: tsx voz.ts

import { transcribe } from "./groq-stt.ts";
import { spawn } from "node:child_process";
import { unlinkSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const TEMP_AUDIO = resolve("voz-temp.wav");

function grabarAudio(): Promise<void> {
  return new Promise((resolve, reject) => {
    process.stderr.write("🎙️  Grabando... (hablá; se corta solo tras 3 seg de silencio)\n");

    const ffmpeg = spawn(
      "ffmpeg",
      [
        "-y",
        "-f", "avfoundation",
        "-i", ":0",
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        "-af", "silencedetect=n=-35dB:d=3",
        TEMP_AUDIO,
      ],
      { stdio: ["pipe", "ignore", "pipe"] }
    );

    let silencioDetectado = false;
    const startedAt = Date.now();
    const MIN_RECORDING_MS = 4_000;

    ffmpeg.stderr.on("data", (data: Buffer) => {
      const line = data.toString();
      // Ignorar silencios durante los primeros segundos (el micrófono arranca)
      if (Date.now() - startedAt < MIN_RECORDING_MS) return;
      // ffmpeg imprime "silence_start: 5.2" cuando detecta silencio de d segundos
      if (line.includes("silence_start") && !silencioDetectado) {
        silencioDetectado = true;
        process.stderr.write("🔇 Silencio detectado, parando grabación...\n");
        ffmpeg.kill("SIGINT");
      }
    });

    ffmpeg.on("close", (code) => {
      // ffmpeg contesta 255 o 0 cuando se lo mata con SIGINT
      if (code === 0 || code === 255 || code === null) {
        resolve();
      } else {
        reject(new Error(`ffmpeg terminó con código ${code}`));
      }
    });

    ffmpeg.on("error", (err: Error) => reject(err));
  });
}

async function main() {
  // Limpia temp anterior si quedó
  if (existsSync(TEMP_AUDIO)) {
    unlinkSync(TEMP_AUDIO);
  }

  await grabarAudio();

  if (!existsSync(TEMP_AUDIO)) {
    throw new Error("El archivo de audio no se creó. ¿Tenés permiso de micro?");
  }

  process.stderr.write("⏳ Transcribiendo con Groq...\n");
  const texto = await transcribe(TEMP_AUDIO);

  // Limpia el temp
  unlinkSync(TEMP_AUDIO);

  // Output del texto a stdout (para que opencode lo capture)
  process.stdout.write(texto);
}

main().catch((err) => {
  process.stderr.write(`❌ Error: ${err.message}\n`);
  process.exit(1);
});
