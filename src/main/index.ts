import { app, BrowserWindow, ipcMain, screen } from 'electron'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function resolvePreloadPath(): string {
  const dir = join(__dirname, '../preload')
  const candidates = [join(dir, 'index.js'), join(dir, 'index.mjs')]
  for (const p of candidates) {
    if (existsSync(p)) return p
  }
  return candidates[0]!
}

/** 与产品 spec：舞台底边内缩，避免贴任务栏 / Dock */
const STAGE_BOTTOM_INSET_PX = 100

export type StageLayout = {
  workX: number
  workY: number
  workWidth: number
  workHeight: number
  windowX: number
  windowY: number
  windowWidth: number
  windowHeight: number
  bottomInsetPx: number
}

function getPrimaryStageLayout(): StageLayout {
  const { workArea } = screen.getPrimaryDisplay()
  const { x, y, width, height } = workArea
  const windowHeight = Math.max(120, Math.floor(height / 3))
  const windowY = y + height - windowHeight
  return {
    workX: x,
    workY: y,
    workWidth: width,
    workHeight: height,
    windowX: x,
    windowY,
    windowWidth: width,
    windowHeight,
    bottomInsetPx: STAGE_BOTTOM_INSET_PX
  }
}

function createWindow(): BrowserWindow {
  const layout = getPrimaryStageLayout()
  const win = new BrowserWindow({
    x: layout.windowX,
    y: layout.windowY,
    width: layout.windowWidth,
    height: layout.windowHeight,
    show: false,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    autoHideMenuBar: true,
    alwaysOnTop: false,
    focusable: true,
    webPreferences: {
      preload: resolvePreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  win.on('ready-to-show', () => {
    win.show()
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    void win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

ipcMain.handle('stage:getLayout', () => getPrimaryStageLayout())

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
