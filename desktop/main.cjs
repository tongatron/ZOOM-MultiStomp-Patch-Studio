const { app, BrowserWindow, Menu, shell, session } = require('electron');
const { spawn } = require('node:child_process');
const { createServer } = require('node:net');
const { join } = require('node:path');

const PROJECT_ROOT = join(__dirname, '..');
const SITE_ROOT = app.isPackaged ? join(process.resourcesPath, 'site') : join(PROJECT_ROOT, 'site');
const SERVER_ENTRY = app.isPackaged ? join(process.resourcesPath, 'deploy', 'server.mjs') : join(PROJECT_ROOT, 'deploy', 'server.mjs');
const START_PAGE = '/ms-60b/';
const PORT_START = 8098;
const AUTH_SITE_URL = 'https://zoommultistompstudio.tongatron.org';

// Set the app identity and its private test profile before Electron creates the
// default session. This keeps the prototype separate from other Electron apps
// and prevents a cached service worker from another local run being reused.
app.setName('ZOOM MultiStomp Studio — Local Test');
app.setPath('userData', join(app.getPath('appData'), 'ZOOM MultiStomp Studio Local Test v1'));

let mainWindow = null;
let localServer = null;
let localOrigin = null;

function findFreePort(start = PORT_START) {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', error => {
      if (error.code === 'EADDRINUSE') return resolve(findFreePort(start + 1));
      reject(error);
    });
    probe.listen(start, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

function waitForServer(url, timeout = 10000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        const response = await fetch(url);
        if (response.ok || response.status < 500) return resolve();
      } catch {}
      if (Date.now() - started > timeout) return reject(new Error(`Local server did not start at ${url}`));
      setTimeout(check, 100);
    };
    check();
  });
}

async function startLocalServer() {
  const port = await findFreePort();
  const dataDir = join(app.getPath('userData'), 'data');
  localOrigin = `http://127.0.0.1:${port}`;
  localServer = spawn(process.execPath, [SERVER_ENTRY], {
    cwd: PROJECT_ROOT,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      ROOT: SITE_ROOT,
      AUTH_PROXY_URL: AUTH_SITE_URL,
      DATA_DIR: dataDir,
      HOST: '127.0.0.1',
      PORT: String(port)
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  localServer.stdout.on('data', data => process.stdout.write(`[site] ${data}`));
  localServer.stderr.on('data', data => process.stderr.write(`[site] ${data}`));
  localServer.once('exit', (code, signal) => {
    if (code !== 0 && signal !== 'SIGTERM') console.error(`Local site server stopped (${code ?? signal})`);
  });
  await waitForServer(`${localOrigin}${START_PAGE}`);
}

function isLocalUrl(url) {
  return Boolean(localOrigin && url.startsWith(localOrigin));
}

function navigate(pathname) {
  if (!mainWindow || !localOrigin) return;
  mainWindow.loadURL(`${localOrigin}${pathname}`);
}

function createApplicationMenu() {
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Studio',
      submenu: [
        { label: 'Effects', click: () => navigate('/ms-60b/') },
        { label: 'Patch builder', accelerator: 'CmdOrCtrl+1', click: () => navigate('/ms-60b/builder.html') },
        { label: 'Pedal manager', accelerator: 'CmdOrCtrl+2', click: () => navigate('/ms-60b/pedal-manager.html') },
        { label: 'Tone ideas', accelerator: 'CmdOrCtrl+3', click: () => navigate('/ms-60b/tones.html') },
        { type: 'separator' },
        { label: 'Reload', role: 'reload' },
        { label: 'Toggle developer tools', role: 'toggleDevTools' }
      ]
    },
    { role: 'windowMenu' },
    { role: 'help', submenu: [{ label: 'Open project folder', click: () => shell.openPath(PROJECT_ROOT) }] }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 800,
    minHeight: 640,
    title: 'ZOOM MultiStomp Studio — Local Test',
    backgroundColor: '#0d1117',
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: join(__dirname, 'preload.cjs')
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!isLocalUrl(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', event => {
    const url = mainWindow.webContents.getURL();
    if (url && !isLocalUrl(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
  mainWindow.on('closed', () => { mainWindow = null; });
  navigate(START_PAGE);
}

async function start() {
  await startLocalServer();
  createApplicationMenu();
  createWindow();
}

app.whenReady().then(async () => {
  // The static site is local; account requests are forwarded to the canonical site by the local server.
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['*://analytics.tongatron.org/*'] }, (details, callback) => callback({ cancel: true }));
  try {
    await start();
  } catch (error) {
    console.error(error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (localServer && !localServer.killed) localServer.kill('SIGTERM');
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (localServer && !localServer.killed) localServer.kill('SIGTERM');
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0 && localOrigin) createWindow();
});
