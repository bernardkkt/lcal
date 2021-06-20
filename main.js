// Modules to control application life and create native browser window
const { app, BrowserWindow, nativeImage, screen, Tray, Menu } = require("electron");
const path = require("path");

// We create a null variables so that the tray and mainWindow don’t get removed by garbage collection
let tray = null;
let mainWindow = null;

const appInfo = {
  dark_icon: nativeImage.createFromDataURL(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAjklEQVRIie1UsQ2AMAyzEUfARQw80Se5qf3CLBRFpQOCFJZ6qpLIdhI1wB/QAY/6wc9WHaeApEVStE50E0V9lLTkGE0yApicjCeScymQnawvyTcAIEkAGCsFrMQeo/mSayPyIT5G1LyDyw6y8lOUk/juo3WBLtAF2sGeigRgcjp6KT9sB8EmXpIHB5572AHlNGizaCf1TAAAAABJRU5ErkJggg=="
  ),
  icon_size: {
    x: 16,
    y: 16
  },
  window_size: {
    x: 444,
    y: 379
  }
};

function createTray() {
  const dark_icon = appInfo.dark_icon;
  let icon = dark_icon;
  let contextMenu = Menu.buildFromTemplate([
    { label: 'Exit', click: () => app.exit(0) }
  ]);
  tray = new Tray(
    icon.resize({
      width: appInfo.icon_size.x,
      height: appInfo.icon_size.y
    })
  );
  tray.setContextMenu(contextMenu);
  tray.on("click", (event, bounds) => {
    if (mainWindow === null) {
      createWindow();
      mainWindow.setAlwaysOnTop(true);
    } else {
      mainWindow.destroy();
    }
  });
  tray.setToolTip("Lunar Calendar");
}

function createWindow() {
  let pos = screen.getCursorScreenPoint();
  let loc = findCoordinate(pos.x, pos.y);

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: appInfo.window_size.x,
    height: appInfo.window_size.y,
    useContentSize: true,
    frame: false,
    resizable: false,
    skipTaskbar: true
  });

  mainWindow.setBounds({
    x: loc.x,
    y: loc.y
  });

  mainWindow.loadFile("./src/calendar.html");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function findCoordinate(cursor_x, cursor_y) {
  let win_cor = { x: null, y: null };
  let scr = screen.getDisplayMatching({
    x: cursor_x,
    y: cursor_y,
    width: 0,
    height: 0
  });

  console.log(findSegment(scr, cursor_x, cursor_y));
  switch (findSegment(scr, cursor_x, cursor_y)) {
    case 0:
      win_cor.x = scr.workArea.x;
      win_cor.y = scr.workArea.y;
      if (cursor_y > win_cor.y + appInfo.window_size.y)
        win_cor.y = cursor_y - appInfo.window_size.y;
      if (cursor_x > win_cor.x + appInfo.window_size.x)
        win_cor.x = cursor_x - appInfo.window_size.x;
      break;
    case 1:
      win_cor.x = scr.workArea.x + scr.workArea.width - appInfo.window_size.x;
      win_cor.y = scr.workArea.y;
      if (cursor_y > win_cor.y + appInfo.window_size.y)
        win_cor.y = cursor_y - appInfo.window_size.y;
      if (cursor_x < win_cor.x) win_cor.x = cursor_x;
      break;
    case 2:
      win_cor.x = scr.workArea.x;
      win_cor.y = scr.workArea.y + scr.workArea.height - appInfo.window_size.y;
      if (cursor_y < win_cor.y) win_cor.y = cursor_y;
      if (cursor_x > win_cor.x + appInfo.window_size.x)
        win_cor.x = cursor_x - appInfo.window_size.x;
      break;
    case 3:
      win_cor.x = scr.workArea.x + scr.workArea.width - appInfo.window_size.x;
      win_cor.y = scr.workArea.y + scr.workArea.height - appInfo.window_size.y;
      if (cursor_y < win_cor.y) win_cor.y = cursor_y;
      if (cursor_x < win_cor.x) win_cor.x = cursor_x;
      break;
  }
  console.log(win_cor);
  return win_cor;
}

function findSegment(scr, cursor_x, cursor_y) {
  // This function returns the integer corresponding
  // to the area below where the cursor resides in
  // |----------
  // |  0 |  1 |
  // |----|----|
  // |  2 |  3 |
  // ----------|
  let scr_center_relative = {
    x: scr.size.width / 2,
    y: scr.size.height / 2
  };
  let cur_pos_ref_centre = {
    x: cursor_x - scr.bounds.x - scr_center_relative.x,
    y: cursor_y - scr.bounds.y - scr_center_relative.y
  };
  if (cur_pos_ref_centre.x < 0) {
    if (cur_pos_ref_centre.y < 0) return 0;
    return 2;
  } else {
    if (cur_pos_ref_centre.y < 0) return 1;
    return 3;
  }
}

app.whenReady().then(() => {
  createTray();
  app.dock.hide();
});

app.on("window-all-closed", function () {});
