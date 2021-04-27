const { app, BrowserWindow, Menu, shell } = require('electron')

var mainWindow = null

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    minWidth: 460,
    height: 720,
    minHeight: 720,
    title: 'The Unus Annus Archive Downloader',
    fullscreenable: true,
    resizable: true,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      worldSafeExecuteJavaScript: true
    },
    autoHideMenuBar: true,
    backgroundColor: '#1c1c1e'
  })

  mainWindow.loadFile('app/index.html')

  Menu.setApplicationMenu(require('./menu'))

  //Make opening links in the user's web browser easier
  mainWindow.webContents.on('new-window', (e, url) => {
    e.preventDefault()
    shell.openExternal(url)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
})