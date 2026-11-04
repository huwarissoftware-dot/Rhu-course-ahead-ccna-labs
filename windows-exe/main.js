// Course Ahead CCNA Labs — Electron main process
// Loads the bundled web app fully offline.
// Publisher: Raja Huwaris Usmani. Window/taskbar icon = his RHU logo (icon.png,
// copied from build/icon.png = assets/logo/icon-512.png).
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

app.setName('Course Ahead CCNA Labs');
// Match the electron-builder appId so Windows groups the taskbar button
// under the installed app (with its stamped RHU icon), not generic Electron.
if (process.platform === 'win32') {
  app.setAppUserModelId('com.courseahead.ccnalabs');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 360,
    minHeight: 560,
    title: 'Course Ahead CCNA Labs',
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
