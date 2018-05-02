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
    withSavedImages(favicons, function(filepath) {
      const img = nativeImage.createFromPath(filepath);

      appIcon.setImage(img);
      mainWindow.setIcon(img);

      appIcon.setContextMenu(contextMenu);
    });
  });
}

function withSavedImages(urls, callback) {
  for (let url of urls) {
    let standard = false;
    let filepath = 'images/icon';

    if (url.endsWith('16dp.png')) {
      standard = true;
      filepath += '.png';
    }
    else if (url.endsWith('24dp.png')) {
      filepath += '@1.5x.png';
    }
    else if (url.endsWith('32dp.png')) {
      filepath += '@2x.png';
    }
    else if (url.endsWith('48dp.png')) {
      filepath += '@3x.png';
    }
    else if (url.endsWith('64dp.png')) {
      filepath += '@4x.png';
    }
    else if (url.endsWith('256dp.png')) {
      continue;
    }

    try {
      fs.accessSync(filepath, fs.constants.F_OK);

      standard && callback(filepath);
    }
    catch (err) {
      let file = fs.createWriteStream(filepath);

      let request = https.get(url, function(response) {
        response.pipe(file);

        file.on('error', function(err2) {
          console.log(err2);

          fs.unlink(filepath, (err3) => {
            console.log(err3);

            file.close(function(err4) {
              console.log(err4);
            });
          });
        });

        file.on('finish', function(err2) {
          if (file.bytesWritten == 0) {
            fs.unlink(filepath, (err3) => {
              console.log(err3);

              file.close(function(err4) {
                console.log(err4);
              });
            });
          }
          else {
            file.close(function(err3) {
              standard && callback(filepath);
            });
          }
        });
      });
    }
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
