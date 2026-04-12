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

declare global {
  interface Window {
    desktopCat?: {
      getStageLayout: () => Promise<StageLayout>
    }
  }
}

export {}
