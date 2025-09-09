// main.js

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
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
ipcMain.on('save-html-dialog', async (event, data) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  try {
    const { htmlContent, defaultPath } = data;
    // Replace colons in the default path to prevent issues on Windows.
    const safeDefaultPath = defaultPath.replace(/:/g, '-');

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

    event.sender.send('save-html-result', { success: true, path: saveResult.filePath, opened: messageBoxResult.response === 0 });
  } catch (err) {
    event.sender.send('save-html-result', { success: false, error: err.message });
  }
});
