// Generates tiny synthetic placeholder SFX (plain sine tones, made from
// scratch, no third-party audio) into public/sfx/. Replace any of them by
// dropping a file with the same name in that folder.
//   node scripts/make-placeholder-sfx.mjs
import { writeFileSync, mkdirSync } from "node:fs";

const RATE = 44100;
mkdirSync("public/sfx", { recursive: true });

// notes: [startSec, freqHz, durSec, gain]; each note has a fast attack and
// exponential decay. `sweep` glides the pitch (Hz per second).
function render(name, notes, { sweep = 0, tail = 0.05 } = {}) {
  const total = Math.max(...notes.map((n) => n[0] + n[2])) + tail;
  const buf = new Float32Array(Math.ceil(total * RATE));
  for (const [start, freq, dur, gain] of notes) {
    const s0 = Math.floor(start * RATE);
    const n = Math.floor(dur * RATE);
    let phase = 0;
    for (let i = 0; i < n; i++) {
      const t = i / RATE;
      phase += (2 * Math.PI * (freq + sweep * t)) / RATE;
      const attack = Math.min(1, t / 0.004);
      const decay = Math.exp((-5 * t) / dur);
      buf[s0 + i] += Math.sin(phase) * attack * decay * gain;
    }
  }
  const pcm = Buffer.alloc(44 + buf.length * 2);
  pcm.write("RIFF", 0);
  pcm.writeUInt32LE(36 + buf.length * 2, 4);
  pcm.write("WAVEfmt ", 8);
  pcm.writeUInt32LE(16, 16);
  pcm.writeUInt16LE(1, 20);
  pcm.writeUInt16LE(1, 22);
  pcm.writeUInt32LE(RATE, 24);
  pcm.writeUInt32LE(RATE * 2, 28);
  pcm.writeUInt16LE(2, 32);
  pcm.writeUInt16LE(16, 34);
  pcm.write("data", 36);
  pcm.writeUInt32LE(buf.length * 2, 40);
  buf.forEach((v, i) =>
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2),
  );
  writeFileSync(`public/sfx/${name}.wav`, pcm);
  console.log(`public/sfx/${name}.wav`);
}

render("click", [[0, 1800, 0.05, 0.5], [0, 900, 0.04, 0.3]]); // enter / execute
render("confirm", [[0, 660, 0.18, 0.4], [0.09, 880, 0.3, 0.4]]); // loading complete
render("alert", [[0, 1000, 0.09, 0.45], [0.14, 1000, 0.09, 0.45]]); // signal detected
render("pop", [[0, 420, 0.12, 0.5]], { sweep: 900 }); // mascot appears (rising blip)
render("success", [[0, 523, 0.14, 0.35], [0.08, 659, 0.14, 0.35], [0.16, 784, 0.35, 0.35]]); // initialized
