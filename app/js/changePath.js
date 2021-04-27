const { remote } = require('electron')
const { app, dialog } = remote.require('electron')
const resolvePath = remote.require('path').resolve

var dir = resolvePath(app.getPath('userData'), 'Downloads')
document.getElementById('download-path').innerText = dir

document.getElementById('change-path').onclick = async() => {
  dir = (await dialog.showOpenDialog({properties: ['openDirectory']})).filePaths[0]
  document.getElementById('download-path').innerText = dir
}