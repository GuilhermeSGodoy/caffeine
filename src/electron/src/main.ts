import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { resolveDataDir } from './app-paths';
import { startBackend, stopBackend, BackendHandle } from './backend-process';

let backendHandle: BackendHandle | null = null;

async function createWindow(): Promise<void> {
  const dataDir = resolveDataDir();
  backendHandle = await startBackend(dataDir, process.resourcesPath);

  ipcMain.on('get-api-base-url', (event) => {
    event.returnValue = backendHandle?.apiBaseUrl;
  });

  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  if (app.isPackaged) {
    await window.loadFile(path.join(process.resourcesPath, 'frontend', 'index.html'));
  } else {
    await window.loadURL('http://localhost:4200');
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (backendHandle) {
    stopBackend(backendHandle);
  }
  app.quit();
});

app.on('before-quit', () => {
  if (backendHandle) {
    stopBackend(backendHandle);
  }
});
