import { contextBridge, ipcRenderer } from 'electron'

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

contextBridge.exposeInMainWorld('desktopCat', {
  getStageLayout: (): Promise<StageLayout> => ipcRenderer.invoke('stage:getLayout')
})
