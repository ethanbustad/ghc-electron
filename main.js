const {app, BrowserWindow, Menu, Shell, Tray} = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1024, height: 768})

  // and load the Google Hangouts Chat site
  mainWindow.loadURL('https://chat.google.com')

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object
    mainWindow = null
  })

  mainWindow.setAutoHideMenuBar(true)

  // open external links (with target=_blank) in default browser
  mainWindow.webContents.on('new-window', (event, url, frameName) => {
    // have to let the _blank window render, or it will block the ultimate destination as well
    if (frameName != '_blank') {
      event.preventDefault()

      Shell.openExternal(url)

      // now that the ultimate destination has rendered, close the _blank window
      for (let win of BrowserWindow.getAllWindows()) {
        if (win.frameName == '_blank') {
          win.close()
        }
      }
    }
  })

  let appIcon = new Tray('images/transparent.png');

  appIcon.setToolTip('GHC Electron.');

  // Linux won't show the app icon unless it has a menu
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Refresh', role: 'forcereload', type: 'normal'},
    {label: 'Quit', role: 'quit', type: 'normal'}
  ]);

  appIcon.setContextMenu(contextMenu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
