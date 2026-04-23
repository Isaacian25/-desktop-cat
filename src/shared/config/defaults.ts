import { CONFIG_VERSION, type UserConfig } from '../types'

export const defaultConfig: UserConfig = {
  version: CONFIG_VERSION,
  locale: 'zh',
  breedId: 'chinese-garden',
  displayId: null,
  anchorRatioX: 1,
  anchorRatioY: 1,
  scale: 1,
  fullscreenAutoPause: true,
  launchToTray: false,
  onboardingDone: false,
  dnd: {
    muted: false,
    translucent: false,
    translucencyPercent: 50,
    pauseInteraction: false
  },
  ui: {
    scale: 1,
    rightMargin: 35,
    companionSink: 60,
    floorAlpha: 0
  },
  petting: {
    sweetSpotX: 0.6,
    sweetSpotY: 0.42,
    sweetSpotRadius: 0.22,
    boostGain: 0.2
  },
  feeding: {
    dropMin: 1,
    dropMax: 1,
    maxActiveTreats: 12,
    dropCooldownSec: 0.16,
    gravity: 720,
    speedMultiplier: 1.1,
    despawnSec: 8,
    eatPauseSec: 0.18
  },
  effects: {
    crumbsEnabled: true,
    maxCrumbs: 28,
    crumbLifeSec: 0.55,
    crumbsPerEat: 5
  }
}

export function migrateConfig(raw: unknown): UserConfig {
  if (!raw || typeof raw !== 'object') return structuredClone(defaultConfig)
  const r = raw as Partial<UserConfig>
  const merged: UserConfig = {
    ...defaultConfig,
    ...r,
    dnd: {
      ...defaultConfig.dnd,
      ...(r.dnd ?? {})
    },
    ui: {
      ...defaultConfig.ui,
      ...(r.ui ?? {})
    },
    petting: {
      ...defaultConfig.petting,
      ...(r.petting ?? {})
    },
    feeding: {
      ...defaultConfig.feeding,
      ...(r.feeding ?? {})
    },
    effects: {
      ...defaultConfig.effects,
      ...(r.effects ?? {})
    },
    version: CONFIG_VERSION
  }
  return merged
}
