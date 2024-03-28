const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const isDev = require('electron-is-dev');


function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.loadURL(
    isDev ? 'http://localhost:3000'
    :
    `file://${path.join(__dirname, '../build/index.html')}`
  )
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.