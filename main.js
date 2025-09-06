// main.js

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Disable hardware acceleration to resolve rendering issues on some Linux systems.
app.disableHardwareAcceleration();

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Hide the menu bar
  win.setMenu(null);

  // Use path.join to correctly point to the 'src' folder
  const indexPath = path.join(__dirname, 'src', 'index.html');
  win.loadFile(indexPath);

  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ==========================
// CODE FOR FILE EXPORT
// ==========================
ipcMain.on('save-html-dialog', (event, data) => {
  const { htmlContent, defaultPath } = data;
  const window = BrowserWindow.fromWebContents(event.sender);

  dialog.showSaveDialog(window, {
    title: 'Save Card Review Results',
    defaultPath: defaultPath,
      filters: [
        { name: 'HTML Files', extensions: ['html'] },
        { name: 'All Files', extensions: ['*'] }
      ]
  }).then(result => {
    if (!result.canceled && result.filePath) {
      fs.writeFile(result.filePath, htmlContent, 'utf8', (err) => {
        if (err) {
          event.sender.send('save-html-result', { success: false, error: err.message });
        } else {
          event.sender.send('save-html-result', { success: true, path: result.filePath });
        }
      });
    } else {
      event.sender.send('save-html-result', { success: false, canceled: true });
    }
  }).catch(err => {
    event.sender.send('save-html-result', { success: false, error: err.message });
  });
});
