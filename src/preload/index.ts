import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc'
import type { AppMode, FeedbackPayload, FeedbackStatus, FeedbackSubmitResult, RuntimeState, StageLayout, UserConfig } from '../shared/types'

contextBridge.exposeInMainWorld('desktopCat', {
  getStageLayout: (): Promise<StageLayout> => ipcRenderer.invoke(IPC_CHANNELS.stageGetLayout),
  getConfig: (): Promise<UserConfig> => ipcRenderer.invoke(IPC_CHANNELS.configGet),
  patchConfig: (patch: Partial<UserConfig>): Promise<UserConfig> =>
    ipcRenderer.invoke(IPC_CHANNELS.configPatch, patch),
  openFeedbackWindow: (): Promise<FeedbackStatus> => ipcRenderer.invoke(IPC_CHANNELS.feedbackOpenWindow),
  closeFeedbackWindow: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.feedbackWindowClose),
  fitFeedbackWindowToContent: (contentHeight: number): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.feedbackWindowFitContent, contentHeight),
  getFeedbackStatus: (): Promise<FeedbackStatus> => ipcRenderer.invoke(IPC_CHANNELS.feedbackStatus),
  submitFeedback: (payload: FeedbackPayload): Promise<FeedbackSubmitResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.feedbackSubmit, payload),
  setMode: (mode: AppMode): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.modeSet, mode),
  quitApp: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.appQuit),
  getRuntime: (): Promise<RuntimeState> => ipcRenderer.invoke(IPC_CHANNELS.runtimeGet),
  setFullscreenPaused: (paused: boolean): Promise<RuntimeState> =>
    ipcRenderer.invoke(IPC_CHANNELS.runtimeSetFullscreenPaused, paused),
  setPointerCapture: (capture: boolean): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.runtimeSetPointerCapture, capture),
  onModeChanged: (handler: (mode: AppMode) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: AppMode) => handler(payload)
    ipcRenderer.on(IPC_CHANNELS.eventModeChanged, listener)
    return () => ipcRenderer.off(IPC_CHANNELS.eventModeChanged, listener)
  },
  onConfigChanged: (handler: (config: UserConfig) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: UserConfig) => handler(payload)
    ipcRenderer.on(IPC_CHANNELS.eventConfigChanged, listener)
    return () => ipcRenderer.off(IPC_CHANNELS.eventConfigChanged, listener)
  },
  onRuntimeChanged: (handler: (runtime: RuntimeState) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: RuntimeState) => handler(payload)
    ipcRenderer.on(IPC_CHANNELS.eventRuntimeChanged, listener)
    return () => ipcRenderer.off(IPC_CHANNELS.eventRuntimeChanged, listener)
  }
})
