const { app, BrowserWindow, Menu, shell, screen } = require('electron')

var mainWindow = null

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    minWidth: isSmallScreen() ? undefined : 640,
    height: 860,
    minHeight: isSmallScreen() ? undefined : 800,
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

function isSmallScreen() {
  const screens = screen.getAllDisplays()
  var isSmall = false
  for (var i = 0; i < screens.length; i++) {
    const { width, height } = screens[i].workAreaSize
    if (width < 740 || height < 900) {
      isSmall = true
    }
  }
  return isSmall
}