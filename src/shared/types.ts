export const CONFIG_VERSION = 1 as const

export type AppMode = 'companion' | 'teaser' | 'petting' | 'feeding'
export type ChasePhase = 'idle' | 'stalk' | 'windup' | 'dash'

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

export type DndState = {
  muted: boolean
  translucent: boolean
  translucencyPercent: number
  pauseInteraction: boolean
}

export type UiTuning = {
  scale: number
  rightMargin: number
  companionSink: number
  floorAlpha: number
}

export type PettingTuning = {
  sweetSpotX: number
  sweetSpotY: number
  sweetSpotRadius: number
  boostGain: number
}

export type FeedingTuning = {
  dropMin: number
  dropMax: number
  maxActiveTreats: number
  dropCooldownSec: number
  gravity: number
  speedMultiplier: number
  despawnSec: number
  eatPauseSec: number
}

export type EffectsTuning = {
  crumbsEnabled: boolean
  maxCrumbs: number
  crumbLifeSec: number
  crumbsPerEat: number
}

export type RuntimeFlags = {
  fullscreenPaused: boolean
}

export type UserConfig = {
  version: number
  locale: 'zh' | 'en'
  breedId: string
  displayId: number | null
  anchorRatioX: number
  anchorRatioY: number
  scale: number
  fullscreenAutoPause: boolean
  launchToTray: boolean
  onboardingDone: boolean
  dnd: DndState
  ui: UiTuning
  petting: PettingTuning
  feeding: FeedingTuning
  effects: EffectsTuning
}

export type RuntimeState = {
  mode: AppMode
  flags: RuntimeFlags
}

export type FeedbackKind = 'bug' | 'idea' | 'other'

export type FeedbackPayload = {
  kind: FeedbackKind
  message: string
  contact?: string
  includeContext: boolean
}

export type FeedbackStatus = {
  dailyLimit: number
  submittedToday: number
  remainingToday: number
}

export type FeedbackSubmitResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'DAILY_LIMIT_REACHED' | 'UNKNOWN' }
