const { app, BrowserWindow } = require('electron')
const path = require('path')


// Functions
function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  win.loadFile('./src/calendar.html')
}


// Events
app.whenReady().then(() => {
    createWindow()
  })