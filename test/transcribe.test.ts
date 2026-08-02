// test/transcribe.test.ts
// Validates the Groq STT pipeline against the committed fixture `voz.wav`.
// Requires GROQ_API_KEY in .env (no mocking — real API call).
// Run: npm test

import { transcribe } from "../groq-stt.ts";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = resolve(__dirname, "../voz.wav");
// Recorded with `temperature=0`; transcript is deterministic across runs.
const EXPECTED = "Hola, necesito que armes un estrés.";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function main() {
  console.log("Testing groq-stt transcribe() with fixture voz.wav\n");

  if (!existsSync(FIXTURE)) {
    console.error(`  ✗ FAIL: fixture not found at ${FIXTURE}`);
    console.error("   voz.wav is gitignored? It should be committed for tests.");
    process.exit(1);
  }

  if (!process.env.GROQ_API_KEY) {
    console.error("  ✗ FAIL: GROQ_API_KEY is not set in .env");
    console.error("    Run: cp .env.example .env  (then paste your key)");
    process.exit(1);
  }

  const result = await transcribe(FIXTURE);

  assert(typeof result === "string", "transcribe() returns a string");
  assert(result.trim().length > 0, "transcript is non-empty");
  assert(
    result.trim() !== "your_groq_api_key_here",
    "transcript is not the .env placeholder"
  );

  const normalized = result.trim();
  const matched = normalized === EXPECTED || normalized === EXPECTED.replace(/á/g, "a");
  if (matched) {
    console.log(`  ✓ transcript matches expected: "${EXPECTED}"`);
  } else {
    console.log(`  ~ transcript differs (expected exact match):`);
    console.log(`    expected: "${EXPECTED}"`);
    console.log(`    got:      "${normalized}"`);
    console.log(`  - If Groq changed the model output, update EXPECTED in this file.`);
    process.exit(1);
  }

  console.log("\nAll checks passed.");
}

main().catch((err: Error) => {
  console.error(`\n  ✗ Error: ${err.message}`);
  process.exit(1);
});
