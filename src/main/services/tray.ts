import { app, BrowserWindow, Menu, Tray, dialog, nativeImage } from 'electron'
import { readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import type { AppMode, UserConfig } from '../../shared/types'

type TrayDeps = {
  getConfig: () => UserConfig
  patchConfig: (patch: Partial<UserConfig>) => UserConfig
  replaceConfig: (raw: unknown) => UserConfig
  getMode: () => AppMode
  setMode: (mode: AppMode) => void
  showWindow: () => void
}

let tray: Tray | null = null
let refreshMenuRef: (() => void) | null = null

function makeTrayIcon() {
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAmUlEQVR4AWNwQANMMDL8Z2Bg+M/AwMDA8P///2fQ5H8GKQYGBgaGBgYGhh8MDAwMDIyM/2fQeRkYGBgYGL4zMDB8x8DAn4GBgYEh8f///5+BgYHhPwMDAwPDf4YGBgYGBkYGhv8MDAwM/2fQmBgaGv4zMDB8x8DAwMDA8J+BgYGBwX8GBgYGBgaG/wQDAwP/fxgYGBr+MwAAWQwQh8WbT4gAAAAASUVORK5CYII='
  return nativeImage.createFromDataURL(`data:image/png;base64,${pngBase64}`)
}

function buildTrayMenu(deps: TrayDeps): Menu {
  const cfg = deps.getConfig()
  const mode = deps.getMode()
  return Menu.buildFromTemplate([
    {
      label: '显示桌面猫',
      click: () => deps.showWindow()
    },
    {
      label: '退出互动模式',
      enabled: mode !== 'companion',
      click: () => deps.setMode('companion')
    },
    { type: 'separator' },
    {
      label: '静音',
      type: 'checkbox',
      checked: cfg.dnd.muted,
      click: () => deps.patchConfig({ dnd: { ...cfg.dnd, muted: !cfg.dnd.muted } })
    },
    {
      label: '半透明',
      type: 'checkbox',
      checked: cfg.dnd.translucent,
      click: () => deps.patchConfig({ dnd: { ...cfg.dnd, translucent: !cfg.dnd.translucent } })
    },
    {
      label: '暂停互动',
      type: 'checkbox',
      checked: cfg.dnd.pauseInteraction,
      click: () => deps.patchConfig({ dnd: { ...cfg.dnd, pauseInteraction: !cfg.dnd.pauseInteraction } })
    },
    {
      label: '全屏自动暂停',
      type: 'checkbox',
      checked: cfg.fullscreenAutoPause,
      click: () => deps.patchConfig({ fullscreenAutoPause: !cfg.fullscreenAutoPause })
    },
    { type: 'separator' },
    {
      label: '导出配置(JSON)…',
      click: async () => {
        const saveResult = await dialog.showSaveDialog({
          title: '导出桌宠配置',
          defaultPath: 'desktop-cat-config.json',
          filters: [{ name: 'JSON', extensions: ['json'] }]
        })
        if (saveResult.canceled || !saveResult.filePath) return
        writeFileSync(saveResult.filePath, JSON.stringify(deps.getConfig(), null, 2), 'utf-8')
      }
    },
    {
      label: '导入配置(JSON)…',
      click: async () => {
        const openResult = await dialog.showOpenDialog({
          title: '导入桌宠配置',
          properties: ['openFile'],
          filters: [{ name: 'JSON', extensions: ['json'] }]
        })
        const filePath = openResult.filePaths[0]
        if (openResult.canceled || !filePath) return
        try {
          const now = new Date()
          const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
          const currentName = basename(filePath)
          const currentExt = extname(currentName)
          const currentStem = currentExt ? currentName.slice(0, -currentExt.length) : currentName
          const backupPath = join(dirname(filePath), `${currentStem}.${stamp}.bak.json`)
          writeFileSync(backupPath, JSON.stringify(deps.getConfig(), null, 2), 'utf-8')

          const rawText = readFileSync(filePath, 'utf-8')
          const raw = JSON.parse(rawText) as unknown
          deps.replaceConfig(raw)
        } catch {
          await dialog.showMessageBox({
            type: 'error',
            title: '导入失败',
            message: '配置文件格式无效，请选择有效的 JSON 配置文件。'
          })
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => app.quit()
    }
  ])
}

export function setupTray(deps: TrayDeps): void {
  if (tray) return
  tray = new Tray(makeTrayIcon())
  tray.setToolTip('Desktop Cat')

  const refreshMenu = () => {
    if (!tray) return
    tray.setContextMenu(buildTrayMenu(deps))
  }

  tray.on('click', () => {
    deps.showWindow()
  })

  refreshMenu()
  refreshMenuRef = refreshMenu
}

export function refreshTrayMenu(): void {
  refreshMenuRef?.()
}

export function showAllWindows(): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (win.isMinimized()) win.restore()
    win.show()
    win.focus()
  }
}
