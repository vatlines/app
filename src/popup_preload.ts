import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  doQuit: async () => ipcRenderer.invoke('doQuit'),
  doContinue: async () => ipcRenderer.invoke('doContinue')
});
