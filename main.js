// main.js — DEV-friendly
const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// If you had to disable HW accel on your machine, uncomment below:
// app.disableHardwareAcceleration();

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
      // Your current app relies on Node in renderer:
      nodeIntegration: true,
      contextIsolation: false,
      // preload: path.join(__dirname, 'src', 'preload.js'), // (not used right now)
      devTools: true,
      sandbox: false
    }
  });

  // Load the app UI
  win.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Minimal menu so accelerators work on Linux/KDE
  setDevMenu();

  // Auto-open DevTools once, detached (easier to see)
  win.once('ready-to-show', () => {
    try {
      win.show();
      win.webContents.openDevTools({ mode: 'detach' });
    } catch {}
  });

  // Extra keyboard toggle: Ctrl+I (no Shift) also toggles DevTools
  win.webContents.on('before-input-event', (event, input) => {
    const key = (input.key || '').toLowerCase();
    if (input.control && !input.shift && key === 'i') {
      try { win.webContents.toggleDevTools(); } catch {}
      event.preventDefault();
    }
  });

  win.on('closed', () => { win = null; });
}

// === PDF/HTML export handler (kept) ===
ipcMain.on('save-html-dialog', async (event, data) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  try {
    const { htmlContent, defaultPath } = data;

    // Replace colons in default path (Windows)
    const safeDefaultPath = (defaultPath || 'CardReview.html').replace(/:/g, '-');

    const saveResult = await dialog.showSaveDialog(window, {
      title: 'Save Card Review Results',
      defaultPath: safeDefaultPath,
      filters: [
        { name: 'HTML Files', extensions: ['html'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (saveResult.canceled || !saveResult.filePath) {
      event.sender.send('save-html-result', { success: false, canceled: true });
      return;
    }

    await fs.promises.writeFile(saveResult.filePath, htmlContent, 'utf8');

    const messageBoxResult = await dialog.showMessageBox(window, {
      type: 'info',
      buttons: ['Open File', 'OK'],
      title: 'Save Successful',
      message: 'File saved successfully!',
      detail: `The file has been saved at: ${saveResult.filePath}`
    });

    if (messageBoxResult.response === 0) {
      shell.openPath(saveResult.filePath);
    }

    event.sender.send('save-html-result', {
      success: true,
      path: saveResult.filePath,
      opened: messageBoxResult.response === 0
    });
  } catch (err) {
    event.sender.send('save-html-result', { success: false, error: err.message });
  }
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
