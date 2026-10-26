// A simulated pedal for tests: answers the SysEx commands of site/pedal-midi.js the way zoom-zt2 expects
// a ZOOM pedal to answer (identity, editor mode, patch memory size, current patch, patch memory). Identity, editor
// mode, memory size and current patch copy the answers of a real MS-60B+ (firmware 1.20, MIDI log of 2026-10-26).
// Used by tools/midi-test.mjs (Node) and injected into the browser as a fake navigator.requestMIDIAccess.
export function fakePedalSource() {
  return `(${fakePedal.toString()})`;
}

export function fakePedal(patches, { device = 0x6e, version = '1.20', count = 100, bankSize = 10 } = {}) {
  const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc32 = b => (Array.from(b).reduce((c, x) => CRC[(c ^ x) & 0xff] ^ (c >>> 8), 0xffffffff) ^ 0xffffffff) >>> 0;
  const pack = data => { const out = []; for (let i = 0; i < data.length; i += 7) { const g = Array.from(data.slice(i, i + 7)); out.push(g.reduce((h, b, k) => h | ((b & 0x80) >> (k + 1)), 0), ...g.map(b => b & 0x7f)); } return out; };
  const size = 848; // patch memory size an MS-60B+ (firmware 1.20) reports; patches are padded with zeros up to it
  const framed = (head, data) => {
    const padded = new Uint8Array(size); padded.set(data);
    const crc = (crc32(padded) ^ 0xffffffff) >>> 0;
    return [0xf0, ...head, size & 0x7f, size >> 7, ...pack(padded), crc & 0x7f, crc >>> 7 & 0x7f, crc >>> 14 & 0x7f, crc >>> 21 & 0x7f, crc >>> 28 & 0x0f, 0xf7];
  };
  let editor = false;
  return function answer(message) {
    const m = Array.from(message);
    if (m[1] === 0x7e && m[3] === 0x06 && m[4] === 0x01) return [0xf0, 0x7e, 0x00, 0x06, 0x02, 0x52, device, 0x00, 0x27, 0x00, ...Array.from(version.padEnd(4), c => c.charCodeAt(0)), 0xf7];
    if (m[1] !== 0x52 || m[3] !== device) return null;
    const cmd = m[4];
    if (cmd === 0x50) { editor = true; return [0xf0, 0x52, 0x00, device, 0x00, 0x00, 0xf7]; }
    if (cmd === 0x51) { editor = false; return [0xf0, 0x52, 0x00, device, 0x00, 0x00, 0xf7]; }
    if (cmd === 0x44) return [0xf0, 0x52, 0x00, device, 0x43, count & 0x7f, count >> 7, size & 0x7f, size >> 7, count & 0x7f, count >> 7, bankSize & 0x7f, bankSize >> 7, 0x02, ...Array(15).fill(0), 0xf7];
    if (cmd === 0x64 && m[5] === 0x13) return editor ? framed([0x52, 0x00, device, 0x64, 0x12, 0x01], patches[0]) : null;
    if (cmd === 0x46) {
      const number = (m[7] | m[8] << 7) * bankSize + (m[9] | m[10] << 7);
      return framed([0x52, 0x00, device, 0x45, 0x00, 0x00, m[7], m[8], m[9], m[10]], patches[number % patches.length]);
    }
    return null;
  };
}
