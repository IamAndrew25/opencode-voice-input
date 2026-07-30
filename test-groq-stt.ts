// test-groq-stt.ts
// Script de prueba: valida que Groq transcribe correctamente SIN tocar opencode.
// Uso: tsx test-groq-stt.ts voz.wav

import { transcribe } from "./groq-stt.ts";

async function main() {
  const audioFile = process.argv[2];

  if (!audioFile) {
    console.error("Uso: tsx test-groq-stt.ts <ruta-al-audio.wav>");
    console.error("Ejemplo: tsx test-groq-stt.ts voz.wav");
    process.exit(1);
  }

  console.log(`Transcribiendo: ${audioFile}...`);

  try {
    const text = await transcribe(audioFile);
    console.log("\n=== TRANSCRIPCIÓN ===");
    console.log(text);
    console.log("====================\n");
    console.log("✅ Groq funciona correctamente.");
  } catch (err: any) {
    console.error("\n❌ Error:", err.message);
    console.error("\nPosibles causas:");
    console.error("  - GROQ_API_KEY incorrecta en .env");
    console.error("  - Archivo de audio no existe");
    console.error("  - Problema de red");
    console.error("  - Rate limit del free tier (esperar 3s)");
    process.exit(1);
  }
}

main();
