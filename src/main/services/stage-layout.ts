import { screen } from 'electron'
import type { StageLayout } from '../../shared/types'

const STAGE_BOTTOM_INSET_PX = 50

export function getPrimaryStageLayout(): StageLayout {
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
