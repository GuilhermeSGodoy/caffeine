import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('caffeine', {
  apiBaseUrl: ipcRenderer.sendSync('get-api-base-url')
});
