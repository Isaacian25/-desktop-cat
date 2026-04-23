import type { AppMode, FeedbackPayload, FeedbackStatus, FeedbackSubmitResult, RuntimeState, StageLayout, UserConfig } from '../../shared/types'

declare global {
  interface Window {
    desktopCat?: {
      getStageLayout: () => Promise<StageLayout>
      getConfig: () => Promise<UserConfig>
      patchConfig: (patch: Partial<UserConfig>) => Promise<UserConfig>
      openFeedbackWindow: () => Promise<FeedbackStatus>
      closeFeedbackWindow: () => Promise<void>
      fitFeedbackWindowToContent: (contentHeight: number) => Promise<void>
      getFeedbackStatus: () => Promise<FeedbackStatus>
      submitFeedback: (payload: FeedbackPayload) => Promise<FeedbackSubmitResult>
      setMode: (mode: AppMode) => Promise<void>
      quitApp: () => Promise<void>
      getRuntime: () => Promise<RuntimeState>
      setFullscreenPaused: (paused: boolean) => Promise<RuntimeState>
      setPointerCapture: (capture: boolean) => Promise<void>
      onModeChanged: (handler: (mode: AppMode) => void) => () => void
      onConfigChanged: (handler: (config: UserConfig) => void) => () => void
      onRuntimeChanged: (handler: (runtime: RuntimeState) => void) => () => void
    }
  }
}

export {}
