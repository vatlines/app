import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  onPttDown: async callback =>
    ipcRenderer.on('ptt-down', (_event, value) => callback(value)),
  onPttUp: async callback =>
    ipcRenderer.on('ptt-up', (_event, value) => callback(value)),
  setPtt: async (pttKey: string) => ipcRenderer.invoke('setPtt', pttKey)
});
