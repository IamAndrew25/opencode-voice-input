// groq-stt.ts
// Función reutilizable: toma un archivo .wav y devuelve el texto transcrito por Groq.
// No sabe nada de opencode. Solo "dame audio, te doy texto" (Single Responsibility).

import { readFileSync, realpathSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

function isMainModule(): boolean {
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]!);
  } catch {
    return false;
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const envPath = resolve(__dirname, ".env");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env not found — rely on --env-file or system env
}

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/audio/transcriptions";
const MODEL = "whisper-large-v3-turbo";

export async function transcribe(audioPath: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY no está definida en el .env");
  }

  const fullPath = resolve(audioPath);
  const fileBuffer = await readFile(fullPath);

  // Construir el multipart/form-data manualmente (compatible con fetch nativo de Node 18+)
  const boundary = "----groq-boundary-" + Math.random().toString(16).slice(2);
  const formData = new FormData();
  formData.append("file", new Blob([fileBuffer]), "audio.wav");
  formData.append("model", MODEL);
  formData.append("language", "es");
  formData.append("response_format", "json");
  formData.append("temperature", "0");

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Groq API error ${response.status}: ${errorText}`
    );
  }

  const data = (await response.json()) as { text: string };
  return data.text;
}

// Permite ejecutarlo directo: `tsx groq-stt.ts voz.wav`
if (isMainModule()) {
  const audioFile = process.argv[2];
  if (!audioFile) {
    console.error("Uso: tsx groq-stt.ts <ruta-al-audio.wav>");
    process.exit(1);
  }
  transcribe(audioFile)
    .then((text) => console.log(text))
    .catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
}
