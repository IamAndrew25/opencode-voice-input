#!/bin/bash
# record.sh - Graba audio del microfono con ffmpeg hasta que apretas q
# Uso: ./record.sh salida.wav

OUTPUT="${1:-grabacion.wav}"

if [ ! -f "$OUTPUT" ]; then
  : # ok, no existe, se va a crear
fi

echo "🎙️  Grabando... (apretá 'q' para parar)"
echo "Archivo de salida: $OUTPUT"
echo ""

ffmpeg -y -f avfoundation -i ":1" -ar 16000 -ac 1 -c:a pcm_s16le "$OUTPUT" 2>&1 | grep -vE "^(frame=|size=)"

echo ""
echo "✅ Grabación finalizada: $OUTPUT"
echo "Tamaño: $(du -h "$OUTPUT" | cut -f1)"
