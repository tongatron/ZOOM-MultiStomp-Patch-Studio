// USB link to the pedal over Web MIDI (Chrome and Edge on a computer).
// The SysEx commands, the 7-bit packing and the CRC32 framing come from zoomzt2.py in the open-source
// zoom-zt2 project (https://github.com/mungewell/zoom-zt2, MIT). They are not documented or supported by ZOOM.
//
// Every command is F0 52 00 <device> <command…> F7: 52 is ZOOM, <device> is the model byte that the pedal
// reports in its identity reply (0x6e in zoom-zt2). Each command answers with one SysEx message.

const PEDALMIDI = (() => {
  const TIMEOUT = 2500;
  let access = null, input = null, output = null, device = 0x6e;
  let log = () => {};
  const waiting = [];

  const hex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join(' ');
  const supported = () => typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;

  // 8 bits → 7 bits: one byte with the high bits of the next (up to) 7 bytes, then those bytes without bit 7
  function pack(data) {
    const out = [];
    for (let i = 0; i < data.length; i += 7) {
      const group = Array.from(data.slice(i, i + 7));
      out.push(group.reduce((hi, b, k) => hi | ((b & 0x80) >> (k + 1)), 0), ...group.map(b => b & 0x7f));
    }
    return out;
  }
  function unpack(packed, length) {
    const out = [];
    for (let i = 0; i < packed.length && out.length < length; i += 8) {
      const hi = packed[i];
      for (let k = 0; k < 7 && i + 1 + k < packed.length && out.length < length; k++) out.push(packed[i + 1 + k] | ((hi & (0x40 >> k)) ? 0x80 : 0));
    }
    return new Uint8Array(out);
  }
  const CRC_TABLE = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc32 = bytes => (Array.from(bytes).reduce((c, b) => CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8), 0xffffffff) ^ 0xffffffff) >>> 0;
  // The pedal sends the inverted CRC32 as five 7-bit groups, lowest first
  const crcOf = tail => ((tail[0] | tail[1] << 7 | tail[2] << 14 | tail[3] << 21 | (tail[4] & 0x0f) << 28) ^ 0xffffffff) >>> 0;

  function onMessage(event) {
    const bytes = event.data;
    if (!bytes || bytes[0] !== 0xf0 || bytes.at(-1) !== 0xf7) return; // ignore program changes, clock and tuner controls
    log('in', bytes);
    const index = waiting.findIndex(entry => entry.matches(bytes));
    if (index === -1) return; // an unsolicited or late answer must not complete another command
    const [entry] = waiting.splice(index, 1);
    entry.resolve(bytes);
  }

  // Asks the browser for MIDI with SysEx (it shows a permission prompt) and returns the ports
  async function ports() {
    if (!supported()) throw new Error('This browser has no Web MIDI. Use Chrome or Edge on a computer.');
    access ??= await navigator.requestMIDIAccess({ sysex: true });
    return { inputs: [...access.inputs.values()], outputs: [...access.outputs.values()] };
  }
  const isZoom = port => /zoom/i.test(port.name || '');

  async function connect(inputId, outputId) {
    const { inputs, outputs } = await ports();
    input = inputs.find(p => p.id === inputId) || inputs.find(isZoom) || null;
    output = outputs.find(p => p.id === outputId) || outputs.find(isZoom) || null;
    if (!input || !output) throw new Error('No ZOOM MIDI port found. Connect the pedal with a USB data cable and switch it on.');
    input.onmidimessage = onMessage;
    await Promise.all([input.open(), output.open()]);
    return { input: input.name, output: output.name };
  }
  function disconnect() {
    if (input) input.onmidimessage = null;
    input = output = null;
    waiting.splice(0).forEach(w => w.reject(new Error('Disconnected')));
  }

  const identityReply = bytes => bytes[1] === 0x7e && bytes[3] === 0x06 && bytes[4] === 0x02 && bytes[5] === 0x52;
  const zoomReply = command => bytes => {
    if (bytes[1] !== 0x52 || bytes[3] !== device) return false;
    const response = bytes[4];
    if (command === 0x44) return response === 0x43;
    if (command === 0x46) return response === 0x45;
    if (command === 0x64) return response === 0x64;
    return response === 0x00 || response === 0x01;
  };

  // Sends F0 <bytes> F7 and waits for the matching SysEx answer
  function request(bytes, matches = () => true) {
    if (!output) return Promise.reject(new Error('Not connected'));
    const message = [0xf0, ...bytes, 0xf7];
    log('out', message);
    return new Promise((resolve, reject) => {
      let timer;
      const entry = { matches, resolve: data => { clearTimeout(timer); resolve(data); }, reject };
      timer = setTimeout(() => {
        const i = waiting.indexOf(entry);
        if (i !== -1) waiting.splice(i, 1);
        reject(new Error(`No answer from the pedal within ${TIMEOUT / 1000} s`));
      }, TIMEOUT);
      waiting.push(entry);
      try { output.send(message); } catch (error) {
        const i = waiting.indexOf(entry);
        if (i !== -1) waiting.splice(i, 1);
        clearTimeout(timer);
        reject(error);
      }
    });
  }
  const zoom = (...command) => request([0x52, 0x00, device, ...command], zoomReply(command[0]));

  // Universal identity request (standard MIDI). The reply carries the ZOOM model byte and the firmware version.
  async function identify() {
    const r = await request([0x7e, 0x7f, 0x06, 0x01], identityReply);
    if (r[1] !== 0x7e || r[3] !== 0x06 || r[4] !== 0x02) throw new Error(`Unexpected identity reply: ${hex(r)}`);
    if (r[5] !== 0x52) throw new Error('The device answering is not a ZOOM product.');
    device = r[6];
    const version = String.fromCharCode(...r.slice(10, 14)).trim();
    return { device, family: r[6] | r[7] << 7, model: r[8] | r[9] << 7, version };
  }
  const editorOn = () => zoom(0x50);
  const editorOff = () => zoom(0x51);

  // Number of patch memories, size of one patch and patches per bank
  async function patchInfo() {
    const r = await zoom(0x44);
    return { count: r[6] << 7 | r[5], size: r[8] << 7 | r[7], bankSize: r[12] << 7 | r[11] };
  }

  // Answer layout: F0 52 00 <device> <command…> <length lo> <length hi> <packed data> <CRC ×5> F7
  function patchFrom(r, lengthAt) {
    const length = r[lengthAt] | r[lengthAt + 1] << 7;
    if (!length) return null;
    const data = unpack(r.slice(lengthAt + 2, r.length - 6), length);
    const crcOk = crcOf(r.slice(r.length - 6, r.length - 1)) === crc32(data);
    // The PTCF header holds the real file size; the memory can be padded after it
    const size = data.length >= 8 ? new DataView(data.buffer).getUint32(4, true) : 0;
    // data: the PTCF file; memory: the whole memory as sent (what a backup must write back)
    return { data: size > 0 && size <= data.length ? data.slice(0, size) : data, memory: data, crcOk, length };
  }
  // The patch being played or edited now (needs editor mode)
  const address = (number, info) => {
    if (!Number.isInteger(number) || number < 1 || number > info.count) throw new Error(`Memory ${number} does not exist (1–${info.count})`);
    const bank = Math.floor((number - 1) / info.bankSize);
    const slot = number - 1 - bank * info.bankSize;
    return [bank & 0x7f, bank >> 7, slot & 0x7f, slot >> 7];
  };
  const readCurrent = async () => patchFrom(await zoom(0x64, 0x13), 7);
  // A stored patch: memory 1…count
  const readMemory = async (number, info) => patchFrom(await zoom(0x46, 0x00, 0x00, ...address(number, info)), 11);
  // Overwrites a stored patch. bytes: a PTCF file (padded with zeros to the memory size) or a whole memory from
  // readMemory().memory. Layout: 45 00 00 <bank lo hi> <slot lo hi> <length lo hi> <packed data> <CRC ×5>
  async function writeMemory(number, info, bytes) {
    if (bytes.length > info.size) throw new Error(`The patch has ${bytes.length} bytes; a memory holds ${info.size}`);
    const data = new Uint8Array(info.size);
    data.set(bytes);
    const crc = (crc32(data) ^ 0xffffffff) >>> 0;
    const r = await zoom(0x45, 0x00, 0x00, ...address(number, info), data.length & 0x7f, data.length >> 7, ...pack(data),
      crc & 0x7f, crc >>> 7 & 0x7f, crc >>> 14 & 0x7f, crc >>> 21 & 0x7f, crc >>> 28 & 0x0f);
    return r;
  }

  return {
    supported, ports, connect, disconnect, identify, editorOn, editorOff, patchInfo, readCurrent, readMemory, writeMemory,
    hex, pack, unpack, crc32, onLog: fn => { log = fn; }, get device() { return device; }
  };
})();
