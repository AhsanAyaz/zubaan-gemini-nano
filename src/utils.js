export function encodeWAV(audio, sampleRate = 16000) {
  const buffer = new ArrayBuffer(44 + audio.length * 2);
  const view = new DataView(buffer);

  // Write WAV header
  // "RIFF" identifier
  writeString(view, 0, "RIFF");
  // File length minus RIFF identifier length and file description length
  view.setUint32(4, 36 + audio.length * 2, true);
  // "WAVE" identifier
  writeString(view, 8, "WAVE");
  // "fmt " chunk identifier
  writeString(view, 12, "fmt ");
  // Chunk length
  view.setUint32(16, 16, true);
  // Sample format (1 is PCM)
  view.setUint16(20, 1, true);
  // Mono (1 channel)
  view.setUint16(22, 1, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // Block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // Bits per sample
  view.setUint16(34, 16, true);
  // "data" chunk identifier
  writeString(view, 36, "data");
  // Chunk length
  view.setUint32(40, audio.length * 2, true);

  // Write audio data
  floatTo16BitPCM(view, 44, audio);

  return buffer;
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(view, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}
