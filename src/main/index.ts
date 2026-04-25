import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { IPC_CHANNELS } from '../shared/ipc'
import type { AppMode, FeedbackPayload, FeedbackSubmitResult, RuntimeState, UserConfig } from '../shared/types'
import { loadConfig, patchConfig, replaceConfig } from './services/config-store'
import { coreBus } from './services/core-bus'
import { getFeedbackStatus, saveFeedback } from './services/feedback-store'
import { setupFullscreenAutoPause } from './services/fullscreen-auto-pause'
import { getPrimaryStageLayout } from './services/stage-layout'
import { refreshTrayMenu, setupTray, showAllWindows } from './services/tray'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function resolvePreloadPath(): string {
  const dir = join(__dirname, '../preload')
  const candidates = [join(dir, 'index.cjs'), join(dir, 'index.js'), join(dir, 'index.mjs')]
  for (const p of candidates) {
    if (existsSync(p)) return p
  }
  return candidates[0]!
}

let mainWindow: BrowserWindow | null = null
let feedbackWindow: BrowserWindow | null = null
let configCache: UserConfig
let stopFullscreenWatcher: (() => void) | null = null
const hasSingleInstanceLock = app.requestSingleInstanceLock()

if (!hasSingleInstanceLock) {
  app.quit()
  app.exit(0)
}
let runtimeState: RuntimeState = {
  mode: 'companion',
  flags: {
    fullscreenPaused: false
  }
}
let pointerCapture = false

function effectivePaused(config: UserConfig, runtime: RuntimeState): boolean {
  return config.dnd.pauseInteraction || (config.fullscreenAutoPause && runtime.flags.fullscreenPaused)
}

function applyWindowBehaviorFromState(win: BrowserWindow, config: UserConfig, runtime: RuntimeState): void {
  const alpha = config.dnd.translucent ? Math.max(0.2, config.dnd.translucencyPercent / 100) : 1
  win.setOpacity(alpha)
  win.setIgnoreMouseEvents(effectivePaused(config, runtime) || !pointerCapture, { forward: true })
}

function broadcastConfigChanged(config: UserConfig): void {
  mainWindow?.webContents.send(IPC_CHANNELS.eventConfigChanged, config)
}

function broadcastRuntimeChanged(runtime: RuntimeState): void {
  mainWindow?.webContents.send(IPC_CHANNELS.eventRuntimeChanged, runtime)
}

function syncUiState(): void {
  if (mainWindow) applyWindowBehaviorFromState(mainWindow, configCache, runtimeState)
  refreshTrayMenu()
  broadcastConfigChanged(configCache)
  broadcastRuntimeChanged(runtimeState)
}

function patchAndSyncConfig(patch: Partial<UserConfig>): UserConfig {
  configCache = patchConfig(configCache, patch)
  syncUiState()
  return configCache
}

function replaceAndSyncConfig(raw: unknown): UserConfig {
  configCache = replaceConfig(raw)
  syncUiState()
  return configCache
}

function setMode(mode: AppMode): void {
  runtimeState = { ...runtimeState, mode }
  coreBus.emitModeChanged(mode)
  syncUiState()
}

function setFullscreenPaused(paused: boolean): RuntimeState {
  runtimeState = {
    ...runtimeState,
    flags: {
      ...runtimeState.flags,
      fullscreenPaused: paused
    }
  }
  syncUiState()
  return runtimeState
}

function setPointerCapture(capture: boolean): void {
  if (pointerCapture === capture) return
  pointerCapture = capture
  syncUiState()
}

function registerGlobalDevShortcuts(): void {
  const bindings: Array<[string, () => void]> = [
    ['F8', () => setMode('feeding')],
    ['CommandOrControl+8', () => setMode('feeding')],
    ['F9', () => setMode('teaser')],
    ['CommandOrControl+9', () => setMode('teaser')],
    ['Escape', () => setMode('companion')],
    ['CommandOrControl+0', () => setMode('companion')],
    ['F10', () => setFullscreenPaused(!runtimeState.flags.fullscreenPaused)]
  ]

  for (const [accelerator, handler] of bindings) {
    globalShortcut.register(accelerator, handler)
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
    alwaysOnTop: true,
    focusable: true,
    webPreferences: {
      preload: resolvePreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  applyWindowBehaviorFromState(win, configCache, runtimeState)
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  win.on('ready-to-show', () => win.show())

  if (process.env['ELECTRON_RENDERER_URL']) {
    void win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

function createFeedbackWindow(): BrowserWindow {
  const width = 500
  const height = 560
  const workArea = screen.getPrimaryDisplay().workArea
  const x = Math.round(workArea.x + (workArea.width - width) / 2)
  const y = Math.round(workArea.y + (workArea.height - height) / 2)
  const win = new BrowserWindow({
    width,
    height,
    x,
    y,
    show: false,
    frame: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    title: '提交反馈',
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: resolvePreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })
  win.setMenuBarVisibility(false)
  win.webContents.on('did-finish-load', () => {
    void fitFeedbackWindowToDocument(win, 'did-finish-load')
  })
  win.on('ready-to-show', () => {
    void fitFeedbackWindowToDocument(win, 'ready-to-show')
    win.show()
    win.focus()
  })
  win.on('closed', () => {
    feedbackWindow = null
  })
  if (process.env['ELECTRON_RENDERER_URL']) {
    void win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/feedback.html`)
  } else {
    void win.loadFile(join(__dirname, '../renderer/feedback.html'))
  }
  return win
}

async function fitFeedbackWindowToDocument(win: BrowserWindow, source: string): Promise<void> {
  if (win.isDestroyed()) return
  try {
    const measured = await win.webContents.executeJavaScript(
      `(() => {
        const body = document.body
        const root = document.documentElement
        if (!body || !root) return 0
        const h = Math.max(
          body.scrollHeight || 0,
          body.offsetHeight || 0,
          root.scrollHeight || 0,
          root.offsetHeight || 0
        )
        return Number.isFinite(h) ? Math.ceil(h) : 0
      })()`,
      true
    )
    const measuredHeight = Number(measured) || 0
    if (measuredHeight <= 0) return
    const nextHeight = Math.max(280, Math.min(900, measuredHeight))
    const [width] = win.getContentSize()
    const before = win.getContentBounds()
    win.setContentSize(width, nextHeight)
    centerWindowInWorkArea(win)
    const after = win.getContentBounds()
    console.info(
      `[feedback-window] fit source=${source} measured=${measuredHeight} next=${nextHeight} before=${before.width}x${before.height} after=${after.width}x${after.height}`
    )
  } catch (error) {
    console.warn(`[feedback-window] fit failed source=${source}`, error)
  }
}

function openFeedbackWindow(): Promise<void> {
  if (feedbackWindow && !feedbackWindow.isDestroyed()) {
    feedbackWindow.show()
    feedbackWindow.focus()
    return new Promise((resolve) => {
      feedbackWindow?.once('closed', () => resolve())
    })
  }
  feedbackWindow = createFeedbackWindow()
  return new Promise((resolve) => {
    feedbackWindow?.once('closed', () => resolve())
  })
}

function centerWindowInWorkArea(win: BrowserWindow): void {
  const bounds = win.getBounds()
  const workArea = screen.getPrimaryDisplay().workArea
  const x = Math.round(workArea.x + (workArea.width - bounds.width) / 2)
  const y = Math.round(workArea.y + (workArea.height - bounds.height) / 2)
  win.setPosition(x, y)
}

function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.stageGetLayout, () => getPrimaryStageLayout())
  ipcMain.handle(IPC_CHANNELS.configGet, () => configCache)
  ipcMain.handle(IPC_CHANNELS.configPatch, (_, patch: Partial<UserConfig>) => patchAndSyncConfig(patch))
  ipcMain.handle(IPC_CHANNELS.feedbackOpenWindow, async () => {
    await openFeedbackWindow()
    return getFeedbackStatus()
  })
  ipcMain.handle(IPC_CHANNELS.feedbackWindowClose, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.close()
  })
  ipcMain.handle(IPC_CHANNELS.feedbackWindowFitContent, (event, contentHeight: number) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    const nextHeight = Math.max(280, Math.min(900, Math.round(contentHeight)))
    const [width] = win.getContentSize()
    const before = win.getContentBounds()
    win.setContentSize(width, nextHeight)
    centerWindowInWorkArea(win)
    const after = win.getContentBounds()
    console.info(
      `[feedback-window] fit source=renderer-ipc measured=${Math.round(contentHeight)} next=${nextHeight} before=${before.width}x${before.height} after=${after.width}x${after.height}`
    )
  })
  ipcMain.handle(IPC_CHANNELS.feedbackStatus, () => getFeedbackStatus())
  ipcMain.handle(IPC_CHANNELS.feedbackSubmit, (_, payload: FeedbackPayload) => {
    try {
      const saved = saveFeedback(payload, configCache, runtimeState)
      const ok: FeedbackSubmitResult = { ok: true, id: saved.id }
      return ok
    } catch (error) {
      const reason =
        error instanceof Error && error.message === 'DAILY_LIMIT_REACHED' ? 'DAILY_LIMIT_REACHED' : 'UNKNOWN'
      const fail: FeedbackSubmitResult = { ok: false, reason }
      return fail
    }
  })
  ipcMain.handle(IPC_CHANNELS.modeSet, (_, mode: AppMode) => {
    setMode(mode)
  })
  ipcMain.handle(IPC_CHANNELS.appQuit, () => {
    app.quit()
  })
  ipcMain.handle(IPC_CHANNELS.runtimeGet, () => runtimeState)
  ipcMain.handle(IPC_CHANNELS.runtimeSetFullscreenPaused, (_, paused: boolean) => {
    return setFullscreenPaused(paused)
  })
  ipcMain.handle(IPC_CHANNELS.runtimeSetPointerCapture, (_, capture: boolean) => {
    setPointerCapture(capture)
  })
}

function registerCoreEventBridge(): void {
  coreBus.onModeChanged((mode) => {
    mainWindow?.webContents.send(IPC_CHANNELS.eventModeChanged, mode)
  })
}

app.whenReady().then(() => {
  configCache = loadConfig()
  registerIpcHandlers()
  registerCoreEventBridge()
  registerGlobalDevShortcuts()

  setupTray({
    getConfig: () => configCache,
    patchConfig: patchAndSyncConfig,
    replaceConfig: replaceAndSyncConfig,
    getMode: () => runtimeState.mode,
    setMode,
    showWindow: showAllWindows
  })

  stopFullscreenWatcher = setupFullscreenAutoPause({
    getWindow: () => mainWindow,
    getAutoPauseEnabled: () => configCache.fullscreenAutoPause,
    setFullscreenPaused
  })

  mainWindow = createWindow()
  syncUiState()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
      syncUiState()
    }
  })
})

app.on('second-instance', () => {
  if (!mainWindow) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  showAllWindows()
  mainWindow.focus()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  stopFullscreenWatcher?.()
  stopFullscreenWatcher = null
  if (process.platform !== 'darwin') app.quit()
})
