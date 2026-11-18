// Keep the renderer isolated. The first desktop prototype needs no privileged
// renderer APIs; future MIDI access can be added here behind a small bridge.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('zoomDesktop', Object.freeze({
  platform: process.platform,
  version: '0.1.0'
}));
