const { Menu } = require('electron')

const isMac = process.platform === 'darwin'

const template = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  ...(!isMac ? [{ role: 'fileMenu' }] : []),
  { role: 'editMenu' },
  { role: 'viewMenu' },
  { role: 'windowMenu' }
]

module.exports = Menu.buildFromTemplate(template)