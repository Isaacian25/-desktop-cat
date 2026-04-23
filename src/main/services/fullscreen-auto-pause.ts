import { app, BrowserWindow, screen, type BrowserWindow as ElectronWindow } from 'electron'

type Deps = {
  getWindow: () => ElectronWindow | null
  getAutoPauseEnabled: () => boolean
  setFullscreenPaused: (paused: boolean) => void
}

/**
 * Conservative heuristic for system fullscreen detection.
 * We only pause when app is unfocused AND at least one display workArea
 * is equal to bounds (typical when menu/dock/taskbar are hidden by fullscreen app).
 */
function looksLikeExternalFullscreenActive(): boolean {
  return screen.getAllDisplays().some((d) => {
    const w = d.workArea
    const b = d.bounds
    return w.width === b.width && w.height === b.height
  })
}

export function setupFullscreenAutoPause(deps: Deps): () => void {
  let timer: NodeJS.Timeout | null = null

  const evaluate = () => {
    if (!deps.getAutoPauseEnabled()) {
      deps.setFullscreenPaused(false)
      return
    }

    const win = deps.getWindow()
    const appFocused = BrowserWindow.getFocusedWindow() !== null
    const windowFocused = win?.isFocused() ?? false
    const shouldPause = !appFocused && !windowFocused && looksLikeExternalFullscreenActive()
    deps.setFullscreenPaused(shouldPause)
  }

  const scheduleEvaluate = (delayMs = 0) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      evaluate()
    }, delayMs)
  }

  const onBlur = () => scheduleEvaluate(250)
  const onFocus = () => scheduleEvaluate(0)
  const onDisplayChanged = () => scheduleEvaluate(100)

  app.on('browser-window-blur', onBlur)
  app.on('browser-window-focus', onFocus)
  screen.on('display-metrics-changed', onDisplayChanged)
  screen.on('display-added', onDisplayChanged)
  screen.on('display-removed', onDisplayChanged)

  const poll = setInterval(() => scheduleEvaluate(0), 2000)
  scheduleEvaluate(0)

  return () => {
    if (timer) clearTimeout(timer)
    clearInterval(poll)
    app.off('browser-window-blur', onBlur)
    app.off('browser-window-focus', onFocus)
    screen.off('display-metrics-changed', onDisplayChanged)
    screen.off('display-added', onDisplayChanged)
    screen.off('display-removed', onDisplayChanged)
  }
}
