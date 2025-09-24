// main.js — “works now” settings (no preload, Node enabled in renderer)

const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// If your GPU / desktop has issues, uncomment this:
// app.disableHardwareAcceleration();

let win;

function setMenu() {
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
      // IMPORTANT: keep these as-is so renderer can use `require(...)`
      nodeIntegration: true,
      contextIsolation: false,
      // Do NOT set a preload (you don’t have src/preload.js right now)
      // preload: path.join(__dirname, 'src', 'preload.js'),
      sandbox: false,
      devTools: true
    }
  });

  const indexPath = path.join(__dirname, 'src', 'index.html');
  win.loadFile(indexPath);

  setMenu();

  win.once('ready-to-show', () => {
    try {
      win.show();
      // win.webContents.openDevTools({ mode: 'detach' });
    } catch {}
  });

  // Simple shortcuts: Ctrl+I and Ctrl+Shift+I both toggle DevTools
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

// HTML export handler used by the renderer (ipcRenderer.send / .on)
ipcMain.on('save-html-dialog', async (event, data) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  try {
    const { htmlContent, defaultPath } = data;
    const safeDefaultPath = (defaultPath || 'CardReview.html').replace(/:/g, '-');

    const saveResult = await dialog.showSaveDialog(window, {
      title: 'Save Card Review Results',
      defaultPath: safeDefaultPath,
      filters: [
        { name: 'HTML Files', extensions: ['html'] },
        { name: 'All Files', extensions: ['*'] },
      ],
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
      detail: `Saved at: ${saveResult.filePath}`,
    });

    if (messageBoxResult.response === 0) {
      shell.openPath(saveResult.filePath);
    }

    event.sender.send('save-html-result', {
      success: true,
      path: saveResult.filePath,
      opened: messageBoxResult.response === 0,
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
