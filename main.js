// main.js — DEV-friendly (based on stable)
// - Preserves preload/contextIsolation/sandbox settings
// - Keeps 'export-html-pdf' IPC handler
// - Restores a minimal menu so Linux/KDE accelerators work
// - Auto-opens DevTools (detached)
// - Adds Ctrl+I (no Fn) and Ctrl+Shift+I to toggle DevTools

const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let win;

function setDevMenu() {
  const template = [
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'toggleDevTools', accelerator: 'Ctrl+Shift+I' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Open README',
          click: async () => {
            const readmePath = path.join(app.getAppPath(), 'README.md');
            if (fs.existsSync(readmePath)) await shell.openPath(readmePath);
          }
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 860,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'src', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      devTools: true
    }
  });

  // Load your app (same as stable)
  win.loadFile(path.join(__dirname, 'src', 'index.html'));

  // DEV aids
  setDevMenu();
  win.once('ready-to-show', () => {
    try {
      win.show();
      win.webContents.openDevTools({ mode: 'detach' });
    } catch {}
  });

  // Low-effort shortcuts: Ctrl+I (no Fn) and Ctrl+Shift+I both toggle DevTools
  win.webContents.on('before-input-event', (event, input) => {
    const key = (input.key || '').toLowerCase();
    if (input.control && !input.shift && key === 'i') {
      try { win.webContents.toggleDevTools(); } catch {}
      event.preventDefault();
    }
    if (input.control && input.shift && key === 'i') {
      try { win.webContents.toggleDevTools(); } catch {}
      event.preventDefault();
    }
  });

  win.on('closed', () => { win = null; });
}

// === PDF export handler preserved ===
// Renderer: await ipcRenderer.invoke('export-html-pdf', optionalTargetPath)
ipcMain.handle('export-html-pdf', async (_evt, targetPath = null) => {
  const target = targetPath || (await dialog.showSaveDialog(win, {
    title: 'Export as PDF',
    defaultPath: 'export.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  })).filePath;

  if (!target) return { ok: false, reason: 'cancelled' };

  const pdfData = await win.webContents.printToPDF({
    printBackground: true,
    landscape: false,
    pageSize: 'A4'
  });

  fs.writeFileSync(target, pdfData);
  return { ok: true, path: target };
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
