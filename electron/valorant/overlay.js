const { BrowserWindow, screen, app } = require('electron');
const path = require('path');

let overlayWindow = null;

function createOverlayWindow() {
  if (overlayWindow) return overlayWindow;

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Make it click-through, Vanguard compliant (No input hooks)
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });

  // Determine if running in Dev or Prod mode
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'test';
  
  if (isDev) {
    overlayWindow.loadURL('http://127.0.0.1:5173/#/overlay');
  } else {
    overlayWindow.loadFile(path.join(__dirname, '..', '..', 'dist', 'index.html'), { hash: 'overlay' });
  }

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  return overlayWindow;
}

function closeOverlay() {
  if (overlayWindow) {
    overlayWindow.close();
  }
}

function getOverlayWindow() {
  return overlayWindow;
}

module.exports = { createOverlayWindow, closeOverlay, getOverlayWindow };
