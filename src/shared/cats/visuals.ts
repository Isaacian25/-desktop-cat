import type { ChasePhase } from '../types'

export type CatFrameAnimation = {
  fps: number
  frames: string[]
}

export type CatVisualManifest = {
  width: number
  height: number
  byPhase: Record<ChasePhase, CatFrameAnimation>
  feeding?: {
    start: CatFrameAnimation
    loop: CatFrameAnimation
    eat: CatFrameAnimation
  }
}

const ROOT = '/cats/chinese-garden'

export const CHINESE_GARDEN_CAT_VISUALS: CatVisualManifest = {
  width: 216,
  height: 168,
  byPhase: {
    idle: {
      fps: 8,
      frames: [
        `${ROOT}/idle/idle_0001.png`,
        `${ROOT}/idle/idle_0002.png`,
        `${ROOT}/idle/idle_0003.png`,
        `${ROOT}/idle/idle_0004.png`,
        `${ROOT}/idle/idle_0005.png`,
        `${ROOT}/idle/idle_0006.png`,
        `${ROOT}/idle/idle_0007.png`,
        `${ROOT}/idle/idle_0008.png`,
        `${ROOT}/idle/idle_0009.png`,
        `${ROOT}/idle/idle_0010.png`,
        `${ROOT}/idle/idle_0011.png`,
        `${ROOT}/idle/idle_0012.png`,
        `${ROOT}/idle/idle_0013.png`,
        `${ROOT}/idle/idle_0014.png`,
        `${ROOT}/idle/idle_0015.png`,
        `${ROOT}/idle/idle_0016.png`,
        `${ROOT}/idle/idle_0017.png`,
        `${ROOT}/idle/idle_0018.png`,
        `${ROOT}/idle/idle_0019.png`,
        `${ROOT}/idle/idle_0020.png`,
        `${ROOT}/idle/idle_0021.png`,
        `${ROOT}/idle/idle_0022.png`,
        `${ROOT}/idle/idle_0023.png`,
        `${ROOT}/idle/idle_0024.png`
      ]
    },
    stalk: {
      fps: 8,
      frames: [
        `${ROOT}/stalk/stalk_0001.png`,
        `${ROOT}/stalk/stalk_0002.png`,
        `${ROOT}/stalk/stalk_0003.png`,
        `${ROOT}/stalk/stalk_0004.png`,
        `${ROOT}/stalk/stalk_0005.png`,
        `${ROOT}/stalk/stalk_0006.png`
      ]
    },
    windup: {
      fps: 11,
      frames: [
        `${ROOT}/windup/windup_0001.png`,
        `${ROOT}/windup/windup_0002.png`,
        `${ROOT}/windup/windup_0003.png`,
        `${ROOT}/windup/windup_0004.png`,
        `${ROOT}/windup/windup_0005.png`,
        `${ROOT}/windup/windup_0006.png`
      ]
    },
    dash: {
      fps: 12,
      frames: [
        `${ROOT}/dash/dash_0001.png`,
        `${ROOT}/dash/dash_0002.png`,
        `${ROOT}/dash/dash_0003.png`,
        `${ROOT}/dash/dash_0004.png`,
        `${ROOT}/dash/dash_0005.png`,
        `${ROOT}/dash/dash_0006.png`,
        `${ROOT}/dash/dash_0007.png`,
        `${ROOT}/dash/dash_0008.png`,
        `${ROOT}/dash/dash_0009.png`,
        `${ROOT}/dash/dash_0010.png`
      ]
    }
  },
  feeding: {
    start: {
      fps: 10,
      frames: [
        `${ROOT}/eat/start/start_0001.png`,
        `${ROOT}/eat/start/start_0002.png`,
        `${ROOT}/eat/start/start_0003.png`,
        `${ROOT}/eat/start/start_0004.png`,
        `${ROOT}/eat/start/start_0005.png`,
        `${ROOT}/eat/start/start_0006.png`,
        `${ROOT}/eat/start/start_0007.png`,
        `${ROOT}/eat/start/start_0008.png`
      ]
    },
    loop: {
      fps: 10,
      frames: [
        `${ROOT}/eat/loop/loop_0001.png`,
        `${ROOT}/eat/loop/loop_0002.png`,
        `${ROOT}/eat/loop/loop_0003.png`,
        `${ROOT}/eat/loop/loop_0004.png`,
        `${ROOT}/eat/loop/loop_0005.png`,
        `${ROOT}/eat/loop/loop_0006.png`,
        `${ROOT}/eat/loop/loop_0007.png`,
        `${ROOT}/eat/loop/loop_0008.png`
      ]
    },
    eat: {
      fps: 10,
      frames: [
        `${ROOT}/eat/eat/eat_0001.png`,
        `${ROOT}/eat/eat/eat_0002.png`,
        `${ROOT}/eat/eat/eat_0003.png`,
        `${ROOT}/eat/eat/eat_0004.png`,
        `${ROOT}/eat/eat/eat_0005.png`,
        `${ROOT}/eat/eat/eat_0006.png`,
        `${ROOT}/eat/eat/eat_0007.png`,
        `${ROOT}/eat/eat/eat_0008.png`
      ]
    }
  }
}
