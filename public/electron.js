const {app, BrowserWindow} = require('electron');
const {autoUpdater} = require('electron-updater')
const log = require('electron-log');

const path = require('path')
const isDev = require('electron-is-dev')

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    resizable: false,
    movable: false,
    width: 1366,
    height: 768,
    webPreferences: {
      allowRunningInsecureContent: true,
      webSecurity: false
    },
  });
  mainWindow.maximize()
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  mainWindow.on('closed', () => mainWindow = null);
}

function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send('message', text);
}


autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', async (info) => {
  try {
    sendStatusToWindow('Update downloaded');
    await autoUpdater.checkForUpdatesAndNotify()
  } catch (err) {
    sendStatusToWindow(err.message);
  }
});


app.commandLine.appendSwitch('disable-http-cache')

app.on('ready', async () => {
  try {
    createWindow()
    await autoUpdater.checkForUpdates();
  } catch (err) {
    sendStatusToWindow(err.message)
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});