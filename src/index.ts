import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
const keybinding = require('../build/Release/keybind');

if (require('electron-squirrel-startup')) app.quit();

const createWindow = () => {
  // Start listening for keybinds
  keybinding.startListening(pttCallback, [0x40]);

  const window = new BrowserWindow({
    width: 806,
    height: 629,
    maximizable: false,
    resizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'main_preload.js')
    },
    icon: path.join(__dirname, '../assets/icons/win/app_icon.ico')
  });
  window.webContents.setWebRTCIPHandlingPolicy('default_public_interface_only');
  window.loadURL('https://vatlines.com/vatlines');
};

const createPopupWindow = () => {
  const win = new BrowserWindow({
    width: 868,
    height: 651,
    fullscreenable: false,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'popup_preload.js'),
      devTools: false
    },
    icon: path.join(__dirname, '../assets/icons/win/app_icon.ico')
  });
  win.loadFile(path.join(__dirname, 'popup.html'));

  ipcMain.handle('doContinue', () => {
    createWindow();
    win.destroy();
  });

  ipcMain.handle('doQuit', () => {
    app.quit();
  });
};

app.whenReady().then(() => {
  createPopupWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createPopupWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('setPtt', (_, key: string) => {
  if (!key) return;
  let pttKey = key.split('+');
  console.debug(pttKey.map(k => WinGlobalKeyLookup[k].keycode));
  keybinding.setPttKeys(pttKey.map(k => WinGlobalKeyLookup[k].keycode));
});

function pttCallback(data: any) {
  const targetWindow = BrowserWindow.getAllWindows()[0];
  if (!targetWindow || targetWindow.id < 1) {
    console.error('no target window for ptt callback');
    return;
  }

  if (data === 'PTT_DOWN') {
    console.debug('ptt is down');
    targetWindow.webContents.send('ptt-down');
  } else if (data === 'PTT_UP') {
    console.debug('ptt is up');
    targetWindow.webContents.send('ptt-up');
  } else {
    console.error('Unknown c++ data', data);
  }
}

const WinGlobalKeyLookup = {
  '0': { keycode: 0x30 },
  '1': { keycode: 0x31 },
  '2': { keycode: 0x32 },
  '3': { keycode: 0x33 },
  '4': { keycode: 0x34 },
  '5': { keycode: 0x35 },
  '6': { keycode: 0x36 },
  '7': { keycode: 0x37 },
  '8': { keycode: 0x38 },
  '9': { keycode: 0x39 },
  A: { keycode: 0x41 },
  B: { keycode: 0x42 },
  C: { keycode: 0x43 },
  D: { keycode: 0x44 },
  E: { keycode: 0x45 },
  F: { keycode: 0x46 },
  G: { keycode: 0x47 },
  H: { keycode: 0x48 },
  I: { keycode: 0x49 },
  J: { keycode: 0x4a },
  K: { keycode: 0x4b },
  L: { keycode: 0x4c },
  M: { keycode: 0x4d },
  N: { keycode: 0x4e },
  O: { keycode: 0x4f },
  P: { keycode: 0x50 },
  Q: { keycode: 0x51 },
  R: { keycode: 0x52 },
  S: { keycode: 0x53 },
  T: { keycode: 0x54 },
  U: { keycode: 0x55 },
  V: { keycode: 0x56 },
  W: { keycode: 0x57 },
  X: { keycode: 0x58 },
  Y: { keycode: 0x59 },
  Z: { keycode: 0x5a },
  LBUTTON: { keycode: 0x01 },
  RBUTTON: { keycode: 0x02 },
  CANCEL: { keycode: 0x03 },
  MBUTTON: { keycode: 0x04 },
  XBUTTON1: { keycode: 0x05 },
  XBUTTON2: { keycode: 0x06 },
  BACKSPACE: { keycode: 0x08 },
  TAB: { keycode: 0x09 },
  RETURN: { keycode: 0x0d },
  SHIFT: { keycode: 0x10 },
  CONTROL: { keycode: 0x11 },
  MENU: { keycode: 0x12 },
  PAUSE: { keycode: 0x13 },
  CAPSLOCK: { keycode: 0x14 },
  KANA: { keycode: 0x15 },
  IME_ON: { keycode: 0x16 },
  JUNJA: { keycode: 0x17 },
  FINAL: { keycode: 0x18 },
  HANJA: { keycode: 0x19 },
  IME_OFF: { keycode: 0x1a },
  ESCAPE: { keycode: 0x1b },
  CONVERT: { keycode: 0x1c },
  NONCONVERT: { keycode: 0x1d },
  ACCEPT: { keycode: 0x1e },
  MODECHANGE: { keycode: 0x1f },
  SPACE: { keycode: 0x20 },
  PRIOR: { keycode: 0x21 },
  NEXT: { keycode: 0x22 },
  END: { keycode: 0x23 },
  HOME: { keycode: 0x24 },
  LEFT: { keycode: 0x25 },
  UP: { keycode: 0x26 },
  RIGHT: { keycode: 0x27 },
  DOWN: { keycode: 0x28 },
  SELECT: { keycode: 0x29 },
  PRINT: { keycode: 0x2a },
  EXECUTE: { keycode: 0x2b },
  SNAPSHOT: { keycode: 0x2c },
  INS: { keycode: 0x2d },
  DELETE: { keycode: 0x2e },
  HELP: { keycode: 0x2f },
  LWIN: { keycode: 0x5b },
  RWIN: { keycode: 0x5c },
  APPS: { keycode: 0x5d },
  SLEEP: { keycode: 0x5f },
  NUMPAD0: { keycode: 0x60 },
  NUMPAD1: { keycode: 0x61 },
  NUMPAD2: { keycode: 0x62 },
  NUMPAD3: { keycode: 0x63 },
  NUMPAD4: { keycode: 0x64 },
  NUMPAD5: { keycode: 0x65 },
  NUMPAD6: { keycode: 0x66 },
  NUMPAD7: { keycode: 0x67 },
  NUMPAD8: { keycode: 0x68 },
  NUMPAD9: { keycode: 0x69 },
  MULTIPLY: { keycode: 0x6a },
  ADD: { keycode: 0x6b },
  CLEAR: { keycode: 0x0c },
  SUBTRACT: { keycode: 0x6d },
  DECIMAL: { keycode: 0x6e },
  DIVIDE: { keycode: 0x6f },
  SEPARATOR: { keycode: 0x6c },
  F1: { keycode: 0x70 },
  F2: { keycode: 0x71 },
  F3: { keycode: 0x72 },
  F4: { keycode: 0x73 },
  F5: { keycode: 0x74 },
  F6: { keycode: 0x75 },
  F7: { keycode: 0x76 },
  F8: { keycode: 0x77 },
  F9: { keycode: 0x78 },
  F10: { keycode: 0x79 },
  F11: { keycode: 0x7a },
  F12: { keycode: 0x7b },
  F13: { keycode: 0x7c },
  F14: { keycode: 0x7d },
  F15: { keycode: 0x7e },
  F16: { keycode: 0x7f },
  F17: { keycode: 0x80 },
  F18: { keycode: 0x81 },
  F19: { keycode: 0x82 },
  F20: { keycode: 0x83 },
  F21: { keycode: 0x84 },
  F22: { keycode: 0x85 },
  F23: { keycode: 0x86 },
  F24: { keycode: 0x87 },
  NUMLOCK: { keycode: 0x90 },
  SCROLL: { keycode: 0x91 },
  LSHIFT: { keycode: 0xa0 },
  RSHIFT: { keycode: 0xa1 },
  LCONTROL: { keycode: 0xa2 },
  RCONTROL: { keycode: 0xa3 },
  LALT: { keycode: 0xa4 },
  RALT: { keycode: 0xa5 },
  BROWSER_BACK: { keycode: 0xa6 },
  BROWSER_FORWARD: { keycode: 0xa7 },
  BROWSER_REFRESH: { keycode: 0xa8 },
  BROWSER_STOP: { keycode: 0xa9 },
  BROWSER_SEARCH: { keycode: 0xaa },
  BROWSER_FAVORITES: { keycode: 0xab },
  BROWSER_HOME: { keycode: 0xac },
  VOLUME_MUTE: { keycode: 0xad },
  VOLUME_DOWN: { keycode: 0xae },
  VOLUME_UP: { keycode: 0xaf },
  MEDIA_NEXT_TRACK: { keycode: 0xb0 },
  MEDIA_PREV_TRACK: { keycode: 0xb1 },
  MEDIA_STOP: { keycode: 0xb2 },
  MEDIA_PLAY_PAUSE: { keycode: 0xb3 },
  LAUNCH_MAIL: { keycode: 0xb4 },
  LAUNCH_MEDIA_SELECT: { keycode: 0xb5 },
  LAUNCH_APP1: { keycode: 0xb6 },
  LAUNCH_APP2: { keycode: 0xb7 },
  SEMICOLON: { keycode: 0xba },
  EQUALS: { keycode: 0xbb },
  COMMA: { keycode: 0xbc },
  MINUS: { keycode: 0xbd },
  DOT: { keycode: 0xbe },
  OEM_2: { keycode: 0xbf },
  SECTION: { keycode: 0xc0 },
  OEM_4: { keycode: 0xdb },
  BACKSLASH: { keycode: 0xdc },
  OEM_6: { keycode: 0xdd },
  QUOTE: { keycode: 0xde },
  OEM_8: { keycode: 0xdf },
  BACKTICK: { keycode: 0xe2 },
  PROCESSKEY: { keycode: 0xe5 },
  PACKET: { keycode: 0xe7 },
  ATTN: { keycode: 0xf6 },
  CRSEL: { keycode: 0xf7 },
  EXSEL: { keycode: 0xf8 },
  EREOF: { keycode: 0xf9 },
  PLAY: { keycode: 0xfa },
  ZOOM: { keycode: 0xfb },
  NONAME: { keycode: 0xfc },
  PA1: { keycode: 0xfd },
  OEM_CLEAR: { keycode: 0xfe }
};
