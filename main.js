const {app, BrowserWindow, Menu, nativeImage, Shell, Tray} = require('electron')
var fs = require('fs');
var https = require('https');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({height: 768, title: 'GHC Electron', width: 1024})

  // and load the Google Hangouts Chat site
  mainWindow.loadURL('https://chat.google.com')

  mainWindow.on('close', function (event) {
    event.preventDefault();

    mainWindow.hide();
  });

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

  appIcon.on('click', function() {
    if (mainWindow.isVisible()) {
      mainWindow.minimize();
    }
    else {
      mainWindow.show();
    }
  });

  appIcon.setToolTip('GHC Electron');

  // Linux won't show the app icon unless it has a menu
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Refresh', role: 'forcereload', type: 'normal'},
    {click: function(mi, bw, e) { mainWindow.destroy(); }, label: 'Quit', type: 'normal'}
  ]);

  appIcon.setContextMenu(contextMenu);

  mainWindow.webContents.on('page-favicon-updated', (event, favicons) => {
    doWithImage(favicons[0], function(filepath) {
      const img = nativeImage.createFromPath(filepath);

      appIcon.setImage(img);
      mainWindow.setIcon(img);

      appIcon.setContextMenu(contextMenu);
    });
  });
}

function doWithImage(url, callback) {
  let start = url.lastIndexOf('/');
  let end = url.indexOf('?', start);

  let filepath = 'images/' + url.slice(start + 1, end < 0 ? url.length : end);

  try {
    fs.accessSync(filepath, fs.constants.F_OK);

    callback(filepath);
  }
  catch (err) {
    var file = fs.createWriteStream(filepath);

    var request = https.get(url, function(response) {
      response.pipe(file);

      file.on('error', function(err) {
        fs.unlink(filepath);
      });

      file.on('finish', function() {
        file.close(function() {
          callback(filepath);
        });
      })
    });
  }
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
