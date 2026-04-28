import { BREED_PROFILES, resolveBreedProfile } from '../../shared/cats/breeds'
import { CHINESE_GARDEN_CAT_VISUALS } from '../../shared/cats/visuals'
import type { AppMode, ChasePhase, EffectsTuning, FeedingTuning, PettingTuning, RuntimeState, UiTuning, UserConfig } from '../../shared/types'
import { CatActor } from './cat-actor'
import { InteractionMachine } from './interaction-machine'
import './style.css'

const BASE_CAT_WIDTH = CHINESE_GARDEN_CAT_VISUALS.width
const BASE_CAT_HEIGHT = CHINESE_GARDEN_CAT_VISUALS.height
const ANCHOR_WIDTH = 16
const ANCHOR_HEIGHT = 16
const FEEDING_ANCHOR_WIDTH = 18
const FEEDING_ANCHOR_HEIGHT = 24
const FEEDING_CAT_BOOST_TIME = 0.2
const FEEDING_CAT_SLOWDOWN_DISTANCE = 160
const FEEDING_WALK_SPEED_SCALE = 0.7
const USER_MENU_HOVER_PAD = 44
const TEASER_IDLE_TIMEOUT_MS = 3000
const INTERACTION_VOLUME_GAIN = 2.0
const INTERACTION_ZONE_WIDTH = 300
const INTERACTION_ZONE_HEIGHT = 200
const SOUND_BANK = {
  eat: ['/sfx/eat_1.mp3', '/sfx/eat_2.mp3'],
  lick: ['/sfx/lick_1.mp3'],
  purrSoft: ['/sfx/purr_soft_1.mp3'],
  purrStrong: ['/sfx/purr_strong_1.mp3', '/sfx/purr_strong_2.mp3'],
  dash: ['/sfx/dash_1.mp3', '/sfx/dash_2.mp3'],
  pounceMiss: ['/sfx/pounce_miss_1.mp3'],
  teaserBell: ['/sfx/teaser_bell_1.mp3'],
  uiOpen: ['/sfx/ui_open_1.mp3'],
  uiClose: ['/sfx/ui_close_1.mp3']
} as const
const DEFAULT_UI_TUNING: UiTuning = {
  scale: 1,
  rightMargin: 35,
  companionSink: 60,
  floorAlpha: 0
}
const DEFAULT_PETTING_TUNING: PettingTuning = {
  sweetSpotX: 0.6,
  sweetSpotY: 0.42,
  sweetSpotRadius: 0.22,
  boostGain: 0.2
}
const DEFAULT_FEEDING_TUNING: FeedingTuning = {
  dropMin: 1,
  dropMax: 1,
  maxActiveTreats: 12,
  dropCooldownSec: 0.16,
  gravity: 720,
  speedMultiplier: 1.1,
  despawnSec: 8,
  eatPauseSec: 0.18
}
const DEFAULT_EFFECTS_TUNING: EffectsTuning = {
  crumbsEnabled: true,
  maxCrumbs: 28,
  crumbLifeSec: 0.55,
  crumbsPerEat: 5
}

const ui: UiTuning = { ...DEFAULT_UI_TUNING }
const petting: PettingTuning = { ...DEFAULT_PETTING_TUNING }
const feeding: FeedingTuning = { ...DEFAULT_FEEDING_TUNING }
const effects: EffectsTuning = { ...DEFAULT_EFFECTS_TUNING }

const label = document.getElementById('layout-label')
const configLabel = document.getElementById('config-label')
const modeLabel = document.getElementById('mode-label')
const runtimeLabel = document.getElementById('runtime-label')
const phaseLabel = document.getElementById('phase-label')
const moodLabel = document.getElementById('mood-label')
const healthLabel = document.getElementById('health-label')
const devHudEl = document.getElementById('dev-hud')
const catShellEl = document.getElementById('cat-shell')
const catEl = document.getElementById('cat')
const pettingFxEl = document.getElementById('petting-fx')
const purrFxEl = document.getElementById('purr-fx')
const teaserAnchorEl = document.getElementById('teaser-anchor')
const feedingAnchorEl = document.getElementById('feeding-anchor')
const treatsLayerEl = document.getElementById('treats-layer')
const uiPanelEl = document.getElementById('ui-tuner')
const uiPanelHeadEl = uiPanelEl?.querySelector('.tuner-head') as HTMLElement | null
const uiTunerDockBtn = document.getElementById('ui-tuner-dock') as HTMLButtonElement | null
const userMenuToggleBtn = document.getElementById('user-menu-toggle') as HTMLButtonElement | null
const userMenuTipEl = document.getElementById('user-menu-tip') as HTMLElement | null
const userMenuEl = document.getElementById('user-menu') as HTMLElement | null
const userBreedInput = document.getElementById('user-breed') as HTMLSelectElement | null
const userFeedBtn = document.getElementById('user-feed') as HTMLButtonElement | null
const userPetBtn = document.getElementById('user-pet') as HTMLButtonElement | null
const userTeaserBtn = document.getElementById('user-teaser') as HTMLButtonElement | null
const userMuteBtn = document.getElementById('user-mute') as HTMLButtonElement | null
const userFeedbackBtn = document.getElementById('user-feedback') as HTMLButtonElement | null
const userLocaleBtn = document.getElementById('user-locale') as HTMLButtonElement | null
const userMoveBtn = document.getElementById('user-move') as HTMLButtonElement | null
const userDevUiBtn = document.getElementById('user-dev-ui') as HTMLButtonElement | null
const userExitBtn = document.getElementById('user-exit') as HTMLButtonElement | null

const scaleInput = document.getElementById('tune-scale') as HTMLInputElement | null
const breedInput = document.getElementById('tune-breed') as HTMLSelectElement | null
const rightInput = document.getElementById('tune-right') as HTMLInputElement | null
const sinkInput = document.getElementById('tune-sink') as HTMLInputElement | null
const floorInput = document.getElementById('tune-floor') as HTMLInputElement | null
const spotXInput = document.getElementById('tune-spot-x') as HTMLInputElement | null
const spotYInput = document.getElementById('tune-spot-y') as HTMLInputElement | null
const spotRadiusInput = document.getElementById('tune-spot-r') as HTMLInputElement | null
const spotGainInput = document.getElementById('tune-spot-gain') as HTMLInputElement | null
const feedMinInput = document.getElementById('tune-feed-min') as HTMLInputElement | null
const feedMaxInput = document.getElementById('tune-feed-max') as HTMLInputElement | null
const feedCapInput = document.getElementById('tune-feed-cap') as HTMLInputElement | null
const feedCdInput = document.getElementById('tune-feed-cd') as HTMLInputElement | null
const feedSpeedInput = document.getElementById('tune-feed-speed') as HTMLInputElement | null
const feedLifeInput = document.getElementById('tune-feed-life') as HTMLInputElement | null
const feedPauseInput = document.getElementById('tune-feed-pause') as HTMLInputElement | null
const fxCrumbsOnInput = document.getElementById('tune-fx-crumbs-on') as HTMLInputElement | null
const fxCrumbsMaxInput = document.getElementById('tune-fx-crumbs-max') as HTMLInputElement | null
const fxCrumbsLifeInput = document.getElementById('tune-fx-crumbs-life') as HTMLInputElement | null
const fxCrumbsPerInput = document.getElementById('tune-fx-crumbs-per') as HTMLInputElement | null
const interactionToggleBtn = document.getElementById('tune-interaction-toggle') as HTMLButtonElement | null
const hideTunerBtn = document.getElementById('tune-hide') as HTMLButtonElement | null
const resetButton = document.getElementById('tune-reset') as HTMLButtonElement | null
const scaleValue = document.getElementById('tune-scale-v')
const breedValue = document.getElementById('tune-breed-v')
const rightValue = document.getElementById('tune-right-v')
const sinkValue = document.getElementById('tune-sink-v')
const floorValue = document.getElementById('tune-floor-v')
const spotXValue = document.getElementById('tune-spot-x-v')
const spotYValue = document.getElementById('tune-spot-y-v')
const spotRadiusValue = document.getElementById('tune-spot-r-v')
const spotGainValue = document.getElementById('tune-spot-gain-v')
const feedMinValue = document.getElementById('tune-feed-min-v')
const feedMaxValue = document.getElementById('tune-feed-max-v')
const feedCapValue = document.getElementById('tune-feed-cap-v')
const feedCdValue = document.getElementById('tune-feed-cd-v')
const feedSpeedValue = document.getElementById('tune-feed-speed-v')
const feedLifeValue = document.getElementById('tune-feed-life-v')
const feedPauseValue = document.getElementById('tune-feed-pause-v')
const fxCrumbsOnValue = document.getElementById('tune-fx-crumbs-on-v')
const fxCrumbsMaxValue = document.getElementById('tune-fx-crumbs-max-v')
const fxCrumbsLifeValue = document.getElementById('tune-fx-crumbs-life-v')
const fxCrumbsPerValue = document.getElementById('tune-fx-crumbs-per-v')

let activeBreed = resolveBreedProfile('chinese-garden')
const machine = new InteractionMachine(activeBreed.teaser)
const catActor = catEl ? new CatActor(catEl, CHINESE_GARDEN_CAT_VISUALS) : null

let currentMode: AppMode = 'companion'
let currentPhase: ChasePhase = 'idle'
let previousPhase: ChasePhase = 'idle'
let stageWidth = window.innerWidth
let stageHeight = window.innerHeight

let catX = Math.max(0, stageWidth - baseCatW() - ui.rightMargin)
let targetX = catX
let anchorX = catX
let anchorY = Math.max(0, stageHeight * 0.4)
let lastDashDir = 1
let facingDir = -1
let lastPointerX = 0
let lastPointerY = 0
let teaserPounceLockUntil = 0
let teaserPounceTargetX = catX

let rafId: number | null = null
let lastTs = performance.now()
let apiRef: NonNullable<Window['desktopCat']> | null = null
let pointerDown = false
let pointerX = 0
let pointerY = 0
let pettingHeat = 0
let happyTimer = 0
let currentMood: 'calm' | 'happy' = 'calm'
let purrCooldown = 0
let panelDragging = false
let panelDragOffsetX = 0
let panelDragOffsetY = 0
const PANEL_POS_STORAGE_KEY = 'desktop-cat.ui-panel.pos.v1'
const CAT_POS_STORAGE_KEY = 'desktop-cat.cat-pos.x.v1'
let feedingCooldown = 0
let feedingVelocityX = 0
let feedingBoostTimer = 0
let feedingEatTimer = 0
let feedingPauseTimer = 0
let feedingWalkStartTimer = 0
let feedingAnimState: 'none' | 'start' | 'loop' | 'eat' | 'hold' = 'none'
let feedingTargetId: number | null = null
let interactionEnabled = true
let pointerCaptureEnabled = false
let nextTreatId = 1
let currentBreedId = activeBreed.id
let devUiVisible = false
let userMenuHovering = false
let userMenuPinnedOpen = false
let userMenuAutoHideAt = 0
const soundCooldowns = new Map<string, number>()
const activeSoundPlayers = new Map<string, HTMLAudioElement[]>()
let audioMuted = false
let feedbackDailyRemaining = 1
let currentLocale: UserConfig['locale'] = 'zh'
let repositionMode = false
let catDragging = false
let catDragOffsetX = 0
let manualCatX: number | null = null
let lastTeaserPointerMoveAt = performance.now()

type Treat = {
  id: number
  x: number
  y: number
  vy: number
  grounded: boolean
  spawnedAt: number
  eatenAt: number | null
}

type Crumb = {
  id: number
  x: number
  y: number
  ttl: number
  life: number
}

const treats: Treat[] = []
const crumbs: Crumb[] = []

const MENU_I18N = {
  zh: {
    toggleAriaLabel: '打开宠物菜单',
    menuAriaLabel: '宠物菜单',
    menuTip: '点击右键展开菜单',
    groupInteraction: '互动',
    groupSystem: '系统',
    feedTitle: '喂冻干',
    feedSub: '切换到喂食模式',
    petTitle: '撸猫',
    petSub: '回到陪伴模式',
    teaserTitle: '逗猫棒',
    teaserSub: '切换到追逐互动',
    muteOn: '声音：已开启',
    muteOff: '声音：已静音',
    muteSub: '点击切换静音',
    feedbackTitle: '反馈建议 / Bug',
    feedbackSub: '提交给开发团队',
    feedbackLimitTip: '已达当日最大提交量1条',
    localeZh: '语言：中文',
    localeEn: '语言：English',
    localeSub: '切换中文 / English',
    moveTitle: '移动位置',
    moveSub: '点击后拖拽猫咪定位，再次点击结束',
    devUiTitle: 'UI参数',
    devUiSub: '技术模式入口',
    exitTitle: '退出程序',
    exitSub: '关闭桌宠'
  },
  en: {
    toggleAriaLabel: 'Open pet menu',
    menuAriaLabel: 'Pet menu',
    menuTip: 'Right-click to open menu',
    groupInteraction: 'Interaction',
    groupSystem: 'System',
    feedTitle: 'Feed Treats',
    feedSub: 'Switch to feeding mode',
    petTitle: 'Pet Cat',
    petSub: 'Back to companion mode',
    teaserTitle: 'Teaser Wand',
    teaserSub: 'Switch to chase interaction',
    muteOn: 'Sound: On',
    muteOff: 'Sound: Muted',
    muteSub: 'Click to toggle mute',
    feedbackTitle: 'Feedback / Bug',
    feedbackSub: 'Send to the team',
    feedbackLimitTip: 'Daily submission limit reached (1)',
    localeZh: 'Language: Chinese',
    localeEn: 'Language: English',
    localeSub: 'Switch Chinese / English',
    moveTitle: 'Move Position',
    moveSub: 'Click to drag cat, click again to finish',
    devUiTitle: 'UI Params',
    devUiSub: 'Developer tools entry',
    exitTitle: 'Exit App',
    exitSub: 'Close desktop pet'
  }
} as const

function applyUiPatch(nextUi: Partial<UiTuning>): void {
  ui.scale = Math.min(1.4, Math.max(0.8, nextUi.scale ?? ui.scale))
  ui.rightMargin = Math.min(180, Math.max(0, nextUi.rightMargin ?? ui.rightMargin))
  ui.companionSink = Math.min(60, Math.max(0, nextUi.companionSink ?? ui.companionSink))
  ui.floorAlpha = Math.min(0.2, Math.max(0, nextUi.floorAlpha ?? ui.floorAlpha))
}

function applyPettingPatch(nextPetting: Partial<PettingTuning>): void {
  petting.sweetSpotX = Math.min(0.8, Math.max(0.2, nextPetting.sweetSpotX ?? petting.sweetSpotX))
  petting.sweetSpotY = Math.min(0.8, Math.max(0.2, nextPetting.sweetSpotY ?? petting.sweetSpotY))
  petting.sweetSpotRadius = Math.min(0.36, Math.max(0.12, nextPetting.sweetSpotRadius ?? petting.sweetSpotRadius))
  petting.boostGain = Math.min(0.4, Math.max(0.05, nextPetting.boostGain ?? petting.boostGain))
}

function applyFeedingPatch(nextFeeding: Partial<FeedingTuning>): void {
  feeding.dropMin = Math.min(4, Math.max(1, Math.round(nextFeeding.dropMin ?? feeding.dropMin)))
  feeding.dropMax = Math.min(6, Math.max(feeding.dropMin, Math.round(nextFeeding.dropMax ?? feeding.dropMax)))
  if (feeding.dropMin === 1 && feeding.dropMax > 1) {
    // Current product setting: single treat drop by default.
    // Keep schema extensible for future multi-drop unlock.
    feeding.dropMax = 1
  }
  feeding.maxActiveTreats = Math.min(24, Math.max(4, Math.round(nextFeeding.maxActiveTreats ?? feeding.maxActiveTreats)))
  feeding.dropCooldownSec = Math.min(0.5, Math.max(0.08, nextFeeding.dropCooldownSec ?? feeding.dropCooldownSec))
  feeding.gravity = Math.min(1200, Math.max(420, nextFeeding.gravity ?? feeding.gravity))
  feeding.speedMultiplier = Math.min(1.6, Math.max(0.8, nextFeeding.speedMultiplier ?? feeding.speedMultiplier))
  feeding.despawnSec = Math.min(20, Math.max(2, nextFeeding.despawnSec ?? feeding.despawnSec))
  feeding.eatPauseSec = Math.min(0.6, Math.max(0, nextFeeding.eatPauseSec ?? feeding.eatPauseSec))
}

function applyEffectsPatch(nextEffects: Partial<EffectsTuning>): void {
  effects.crumbsEnabled = nextEffects.crumbsEnabled ?? effects.crumbsEnabled
  effects.maxCrumbs = Math.min(80, Math.max(0, Math.round(nextEffects.maxCrumbs ?? effects.maxCrumbs)))
  effects.crumbLifeSec = Math.min(2, Math.max(0.2, nextEffects.crumbLifeSec ?? effects.crumbLifeSec))
  effects.crumbsPerEat = Math.min(12, Math.max(0, Math.round(nextEffects.crumbsPerEat ?? effects.crumbsPerEat)))
}

function feedingMaxSpeed(): number {
  return 260 * feeding.speedMultiplier * FEEDING_WALK_SPEED_SCALE
}

function feedingAccel(): number {
  return 780 * feeding.speedMultiplier * FEEDING_WALK_SPEED_SCALE
}

function feedingBoostSpeed(): number {
  return 360 * feeding.speedMultiplier * FEEDING_WALK_SPEED_SCALE
}

function baseCatW(): number {
  return Math.round(BASE_CAT_WIDTH * ui.scale)
}

function baseCatH(): number {
  return Math.round(BASE_CAT_HEIGHT * ui.scale)
}

function setText(el: HTMLElement | null, text: string): void {
  if (el) el.textContent = text
}

function tryPlaySound(
  key: keyof typeof SOUND_BANK,
  probability = 0.3,
  cooldownSec = 0,
  volume = 0.45
): void {
  if (audioMuted) return
  const files = SOUND_BANK[key]
  const now = performance.now()
  const cooldownUntil = soundCooldowns.get(key) ?? 0
  if (now < cooldownUntil) return
  if (Math.random() > probability) return
  const src = files[Math.floor(Math.random() * files.length)]!
  const audio = new Audio(src)
  audio.volume = Math.max(0, Math.min(1, volume))
  void audio.play().catch(() => {})
  const group = activeSoundPlayers.get(key) ?? []
  group.push(audio)
  activeSoundPlayers.set(key, group)
  audio.addEventListener(
    'ended',
    () => {
      const list = activeSoundPlayers.get(key)
      if (!list) return
      const idx = list.indexOf(audio)
      if (idx >= 0) list.splice(idx, 1)
    },
    { once: true }
  )
  soundCooldowns.set(key, now + cooldownSec * 1000)
}

function stopSoundGroup(key: keyof typeof SOUND_BANK): void {
  const list = activeSoundPlayers.get(key)
  if (!list || list.length === 0) return
  for (const audio of list) {
    audio.pause()
    audio.currentTime = 0
  }
  list.length = 0
}

function interactionVolume(base: number): number {
  return Math.min(1, Math.max(0, base * INTERACTION_VOLUME_GAIN))
}

function menuText() {
  return currentLocale === 'en' ? MENU_I18N.en : MENU_I18N.zh
}

function setMenuButtonText(button: HTMLButtonElement | null, title: string, sub: string): void {
  if (!button) return
  const titleEl = button.querySelector('.menu-title')
  const subEl = button.querySelector('.menu-sub')
  if (titleEl) titleEl.textContent = title
  if (subEl) subEl.textContent = sub
}

function applyUserMenuLocale(): void {
  const t = menuText()
  if (userMenuToggleBtn) userMenuToggleBtn.setAttribute('aria-label', t.toggleAriaLabel)
  if (userMenuEl) userMenuEl.setAttribute('aria-label', t.menuAriaLabel)
  if (userMenuTipEl) userMenuTipEl.textContent = t.menuTip
  const groupTitles = userMenuEl?.querySelectorAll('.menu-group-title')
  if (groupTitles?.[0]) groupTitles[0].textContent = t.groupInteraction
  if (groupTitles?.[1]) groupTitles[1].textContent = t.groupSystem
  setMenuButtonText(userFeedBtn, t.feedTitle, t.feedSub)
  setMenuButtonText(userPetBtn, t.petTitle, t.petSub)
  setMenuButtonText(userTeaserBtn, t.teaserTitle, t.teaserSub)
  setMenuButtonText(userFeedbackBtn, t.feedbackTitle, t.feedbackSub)
  setMenuButtonText(userDevUiBtn, t.devUiTitle, t.devUiSub)
  setMenuButtonText(userExitBtn, t.exitTitle, t.exitSub)
  const localeTitle = currentLocale === 'en' ? t.localeEn : t.localeZh
  setMenuButtonText(userLocaleBtn, localeTitle, t.localeSub)
  syncMuteButtonText()
  syncMoveButtonText()
  syncFeedbackAvailability()
}

function syncMuteButtonText(): void {
  const t = menuText()
  const label = audioMuted ? t.muteOff : t.muteOn
  setMenuButtonText(userMuteBtn, label, t.muteSub)
}

function syncFeedbackAvailability(): void {
  if (!userFeedbackBtn) return
  const t = menuText()
  const disabled = feedbackDailyRemaining <= 0
  userFeedbackBtn.disabled = disabled
  userFeedbackBtn.title = disabled ? t.feedbackLimitTip : ''
}

function syncMoveButtonText(): void {
  const t = menuText()
  setMenuButtonText(userMoveBtn, t.moveTitle, t.moveSub)
}

function saveManualCatX(): void {
  try {
    localStorage.setItem(CAT_POS_STORAGE_KEY, `${Math.round(catX)}`)
  } catch {}
}

function loadManualCatX(): void {
  try {
    const raw = localStorage.getItem(CAT_POS_STORAGE_KEY)
    if (!raw) return
    const parsed = Number.parseFloat(raw)
    if (Number.isFinite(parsed)) manualCatX = parsed
  } catch {}
}

function modeLabelText(mode: AppMode): string {
  if (mode === 'teaser') return '逗猫'
  if (mode === 'feeding') return '喂食'
  return '陪伴'
}

function phaseLabelText(phase: ChasePhase): string {
  if (phase === 'stalk') return '潜行'
  if (phase === 'windup') return '蓄力'
  if (phase === 'dash') return '冲刺'
  return '待机'
}

function approach(current: number, target: number, maxDelta: number): number {
  if (current < target) return Math.min(current + maxDelta, target)
  return Math.max(current - maxDelta, target)
}

function clampPanelPosition(left: number, top: number): { left: number; top: number } {
  if (!uiPanelEl) return { left, top }
  const maxLeft = Math.max(8, stageWidth - uiPanelEl.offsetWidth - 8)
  const maxTop = Math.max(8, stageHeight - uiPanelEl.offsetHeight - 8)
  return {
    left: Math.max(8, Math.min(maxLeft, left)),
    top: Math.max(8, Math.min(maxTop, top))
  }
}

function applyPanelPosition(left: number, top: number): void {
  if (!uiPanelEl) return
  const next = clampPanelPosition(left, top)
  uiPanelEl.style.left = `${next.left}px`
  uiPanelEl.style.top = `${next.top}px`
}

function savePanelPosition(): void {
  if (!uiPanelEl) return
  try {
    localStorage.setItem(
      PANEL_POS_STORAGE_KEY,
      JSON.stringify({
        left: Number.parseFloat(uiPanelEl.style.left) || 10,
        top: Number.parseFloat(uiPanelEl.style.top) || 8
      })
    )
  } catch {}
}

function loadPanelPosition(): void {
  if (!uiPanelEl) return
  try {
    const raw = localStorage.getItem(PANEL_POS_STORAGE_KEY)
    if (!raw) {
      applyPanelPosition(10, 8)
      return
    }
    const parsed = JSON.parse(raw) as { left?: number; top?: number }
    applyPanelPosition(parsed.left ?? 10, parsed.top ?? 8)
  } catch {
    applyPanelPosition(10, 8)
  }
}

function renderConfig(config: UserConfig): void {
  if (config.breedId !== currentBreedId) {
    currentBreedId = config.breedId
    activeBreed = resolveBreedProfile(currentBreedId)
    machine.setProfile(activeBreed.teaser)
  } else {
    activeBreed = resolveBreedProfile(currentBreedId)
  }
  applyUiPatch(config.ui)
  applyPettingPatch(config.petting)
  applyFeedingPatch(config.feeding)
  applyEffectsPatch(config.effects)
  audioMuted = config.dnd.muted
  currentLocale = config.locale
  applyUserMenuLocale()
  const dndBits = [
    `静音=${config.dnd.muted ? '开' : '关'}`,
    `透明=${config.dnd.translucent ? `${config.dnd.translucencyPercent}%` : '否'}`,
    `互动=${config.dnd.pauseInteraction ? '暂停' : '开启'}`,
    `全屏自动暂停=${config.fullscreenAutoPause ? '开' : '关'}`
  ].join(' · ')
  setText(configLabel, `配置v${config.version} · 猫种=${activeBreed.nameZh} · ${dndBits}`)
}

function renderRuntime(runtime: RuntimeState): void {
  setText(runtimeLabel, `运行状态 · 全屏暂停=${runtime.flags.fullscreenPaused ? '是' : '否'}`)
}

function renderPhase(phase: ChasePhase): void {
  previousPhase = currentPhase
  currentPhase = phase
  if (catEl) catEl.setAttribute('data-phase', phase)
  catActor?.setPhase(phase)
  setText(phaseLabel, `追逐阶段 · ${phaseLabelText(phase)}`)
  if (phase === 'dash') tryPlaySound('dash', 0.3, 1.0, interactionVolume(0.38))
  if (previousPhase === 'dash' && phase === 'stalk') tryPlaySound('pounceMiss', 0.3, 1.8, interactionVolume(0.34))
}

function renderMood(nextMood: 'calm' | 'happy'): void {
  if (currentMood === nextMood) return
  currentMood = nextMood
  setText(moodLabel, `心情 · ${nextMood === 'happy' ? '开心' : '平静'}`)
}

function renderHealth(): void {
  const activeTreats = treats.filter((t) => t.eatenAt === null).length
  setText(
    healthLabel,
    `状态 · 模式=${modeLabelText(currentMode)} · 冻干=${activeTreats}/${Math.round(feeding.maxActiveTreats)} · 碎屑=${crumbs.length} · 特效=${
      effects.crumbsEnabled ? '开' : '关'
    } · 交互捕获=${pointerCaptureEnabled ? '是' : '否'}`
  )
}

function setTunerVisible(visible: boolean): void {
  if (uiPanelEl) uiPanelEl.style.display = visible && devUiVisible ? 'grid' : 'none'
  if (uiTunerDockBtn) uiTunerDockBtn.style.display = visible && devUiVisible ? 'none' : 'inline-flex'
  if (!devUiVisible && uiTunerDockBtn) uiTunerDockBtn.style.display = 'none'
  void syncPointerCapture()
}

function setDevUiVisible(visible: boolean): void {
  devUiVisible = visible
  if (devHudEl) devHudEl.style.display = visible ? 'flex' : 'none'
  if (userDevUiBtn) userDevUiBtn.style.display = visible ? 'flex' : 'none'
  if (!visible) {
    if (uiPanelEl) uiPanelEl.style.display = 'none'
    if (uiTunerDockBtn) uiTunerDockBtn.style.display = 'none'
  } else {
    setTunerVisible(true)
  }
  void syncPointerCapture()
}

function setUserMenuVisible(visible: boolean): void {
  const wasVisible = userMenuEl?.style.display !== 'none'
  if (userMenuEl) userMenuEl.style.display = visible ? 'grid' : 'none'
  if (visible) syncMoveButtonText()
  if (!wasVisible && visible) tryPlaySound('uiOpen', 0.3, 0.2, 0.3)
  if (wasVisible && !visible) tryPlaySound('uiClose', 0.3, 0.2, 0.3)
  if (!visible) userMenuPinnedOpen = false
  void syncPointerCapture()
}

function isPointerNearCat(): boolean {
  return inRect(
    pointerX,
    pointerY,
    catX - USER_MENU_HOVER_PAD,
    catTopY() - USER_MENU_HOVER_PAD,
    baseCatW() + USER_MENU_HOVER_PAD * 2,
    baseCatH() + USER_MENU_HOVER_PAD * 2
  )
}

function updateUserMenuAnchor(): void {
  if (!userMenuToggleBtn) return
  const toggleW = userMenuToggleBtn.offsetWidth || 32
  const toggleH = userMenuToggleBtn.offsetHeight || 32
  const left = Math.max(6, Math.min(stageWidth - toggleW - 6, catX + baseCatW() - toggleW + 6))
  const top = Math.max(6, catTopY() - 10)
  userMenuToggleBtn.style.left = `${left}px`
  userMenuToggleBtn.style.top = `${top}px`
  userMenuToggleBtn.classList.toggle('visible', userMenuHovering || userMenuPinnedOpen)

  if (userMenuTipEl) {
    userMenuTipEl.style.left = `${Math.max(6, left - 88)}px`
    userMenuTipEl.style.top = `${Math.max(6, top - 28)}px`
  }
  if (userMenuEl && userMenuEl.style.display !== 'none') {
    const menuLeft = Math.max(6, Math.min(stageWidth - 220 - 6, left - 188))
    const menuTop = Math.max(6, Math.min(stageHeight - 240, top + toggleH + 4))
    userMenuEl.style.left = `${menuLeft}px`
    userMenuEl.style.top = `${menuTop}px`
  }
}

function syncUserMenuVisibility(now: number): void {
  const pointerOverToggle =
    !!userMenuToggleBtn &&
    userMenuToggleBtn.classList.contains('visible') &&
    inRect(pointerX, pointerY, userMenuToggleBtn.offsetLeft, userMenuToggleBtn.offsetTop, userMenuToggleBtn.offsetWidth || 32, userMenuToggleBtn.offsetHeight || 32)
  const pointerOverMenu =
    !!userMenuEl &&
    userMenuEl.style.display !== 'none' &&
    inRect(pointerX, pointerY, userMenuEl.offsetLeft, userMenuEl.offsetTop, userMenuEl.offsetWidth || 220, userMenuEl.offsetHeight || 220)
  userMenuHovering = isPointerNearCat() || pointerOverToggle || pointerOverMenu
  if (userMenuHovering || userMenuPinnedOpen) userMenuAutoHideAt = now + 30000
  const shouldShowToggle = userMenuHovering || userMenuPinnedOpen || now < userMenuAutoHideAt
  if (userMenuToggleBtn) userMenuToggleBtn.classList.toggle('visible', shouldShowToggle)
  if (userMenuTipEl) userMenuTipEl.classList.toggle('visible', pointerOverToggle)
  if (!userMenuPinnedOpen && now > userMenuAutoHideAt) setUserMenuVisible(false)
}

function syncInteractionControls(): void {
  if (interactionToggleBtn) interactionToggleBtn.textContent = interactionEnabled ? '暂停互动' : '恢复互动'
}

function isEventInsideUiPanel(target: EventTarget | null): boolean {
  if (!(target instanceof Node)) return false
  return !!(
    (uiPanelEl && uiPanelEl.contains(target)) ||
    (uiTunerDockBtn && uiTunerDockBtn.contains(target)) ||
    (userMenuEl && userMenuEl.contains(target)) ||
    (userMenuToggleBtn && userMenuToggleBtn.contains(target))
  )
}

function inRect(x: number, y: number, left: number, top: number, width: number, height: number): boolean {
  return x >= left && x <= left + width && y >= top && y <= top + height
}

function getInteractionZone(): { left: number; top: number; width: number; height: number } {
  const cx = catX + baseCatW() / 2
  const cy = catTopY() + baseCatH() / 2
  const width = INTERACTION_ZONE_WIDTH
  const height = INTERACTION_ZONE_HEIGHT
  return {
    left: cx - width / 2,
    top: cy - height / 2,
    width,
    height
  }
}

function shouldCapturePointer(): boolean {
  if (repositionMode || catDragging) return true
  if (userMenuEl && userMenuEl.style.display !== 'none') return true

  if (uiPanelEl && uiPanelEl.style.display !== 'none') {
    const rect = uiPanelEl.getBoundingClientRect()
    if (inRect(pointerX, pointerY, rect.left, rect.top, rect.width, rect.height)) return true
  }
  if (uiTunerDockBtn && uiTunerDockBtn.style.display !== 'none') {
    const rect = uiTunerDockBtn.getBoundingClientRect()
    if (inRect(pointerX, pointerY, rect.left, rect.top, rect.width, rect.height)) return true
  }
  if (userMenuEl && userMenuEl.style.display !== 'none') {
    const rect = userMenuEl.getBoundingClientRect()
    if (inRect(pointerX, pointerY, rect.left, rect.top, rect.width, rect.height)) return true
  }
  if (userMenuToggleBtn) {
    const visible = userMenuToggleBtn.classList.contains('visible')
    if (visible) {
      const rect = userMenuToggleBtn.getBoundingClientRect()
      if (inRect(pointerX, pointerY, rect.left, rect.top, rect.width, rect.height)) return true
    }
  }
  if (!interactionEnabled) return false
  // Feeding is an explicit user-triggered mode: keep it fully interactive.
  if (currentMode === 'feeding') return true
  const zone = getInteractionZone()
  if (!inRect(pointerX, pointerY, zone.left, zone.top, zone.width, zone.height)) return false
  if (currentMode !== 'companion') return false
  const pad = 18
  return inRect(pointerX, pointerY, catX - pad, catTopY() - pad, baseCatW() + pad * 2, baseCatH() + pad * 2)
}

async function syncPointerCapture(): Promise<void> {
  if (!apiRef) return
  const next = shouldCapturePointer()
  if (next === pointerCaptureEnabled) return
  pointerCaptureEnabled = next
  await apiRef.setPointerCapture(next)
  renderHealth()
}

function applyModeToMachine(mode: AppMode): void {
  currentMode = mode
  machine.setTeaserEnabled(interactionEnabled && mode === 'teaser')
  if (mode === 'companion') {
    const homeX = defaultCompanionX()
    catX = homeX
    targetX = homeX
  }
  if (teaserAnchorEl) teaserAnchorEl.style.opacity = interactionEnabled && mode === 'teaser' ? '1' : '0'
  if (feedingAnchorEl) feedingAnchorEl.style.opacity = interactionEnabled && mode === 'feeding' ? '1' : '0'
  void syncPointerCapture()
}

function phaseSpeedPxPerSec(phase: ChasePhase): number {
  switch (phase) {
    case 'dash':
      return activeBreed.teaser.speedDash
    case 'stalk':
      return activeBreed.teaser.speedStalk
    case 'windup':
      return activeBreed.teaser.speedWindup
    default:
      return 0
  }
}

function stageFloorInset(): number {
  return Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--floor-h')) || 50
}

function maxCatX(): number {
  return Math.max(0, stageWidth - baseCatW())
}

function defaultCompanionX(): number {
  if (manualCatX !== null) return clampTargetX(manualCatX)
  return clampTargetX(stageWidth - baseCatW() - ui.rightMargin)
}

function clampTargetX(x: number): number {
  return Math.min(Math.max(0, x), maxCatX())
}

function clampAnchorY(y: number): number {
  const maxY = Math.max(0, stageHeight - stageFloorInset() - baseCatH() - 40)
  return Math.min(Math.max(24, y), maxY)
}

function applyUiStyle(): void {
  document.documentElement.style.setProperty('--floor-alpha', `${ui.floorAlpha}`)
  if (catShellEl) {
    catShellEl.style.width = `${baseCatW()}px`
    catShellEl.style.height = `${baseCatH()}px`
  }
  if (catEl) {
    catEl.style.width = `${baseCatW()}px`
    catEl.style.height = `${baseCatH()}px`
  }
  if (scaleInput) scaleInput.value = ui.scale.toFixed(2)
  if (breedInput) {
    if (breedInput.options.length === 0) {
      for (const b of BREED_PROFILES) {
        const opt = document.createElement('option')
        opt.value = b.id
        opt.textContent = b.nameZh
        breedInput.appendChild(opt)
      }
    }
    breedInput.value = currentBreedId
  }
  if (userBreedInput) userBreedInput.value = currentBreedId
  if (rightInput) rightInput.value = `${Math.round(ui.rightMargin)}`
  if (sinkInput) sinkInput.value = `${Math.round(ui.companionSink)}`
  if (floorInput) floorInput.value = ui.floorAlpha.toFixed(2)
  if (spotXInput) spotXInput.value = petting.sweetSpotX.toFixed(2)
  if (spotYInput) spotYInput.value = petting.sweetSpotY.toFixed(2)
  if (spotRadiusInput) spotRadiusInput.value = petting.sweetSpotRadius.toFixed(2)
  if (spotGainInput) spotGainInput.value = petting.boostGain.toFixed(2)
  if (feedMinInput) feedMinInput.value = `${Math.round(feeding.dropMin)}`
  if (feedMaxInput) feedMaxInput.value = `${Math.round(feeding.dropMax)}`
  if (feedCapInput) feedCapInput.value = `${Math.round(feeding.maxActiveTreats)}`
  if (feedCdInput) feedCdInput.value = feeding.dropCooldownSec.toFixed(2)
  if (feedSpeedInput) feedSpeedInput.value = feeding.speedMultiplier.toFixed(2)
  if (feedLifeInput) feedLifeInput.value = `${Math.round(feeding.despawnSec)}`
  if (feedPauseInput) feedPauseInput.value = feeding.eatPauseSec.toFixed(2)
  if (fxCrumbsOnInput) fxCrumbsOnInput.checked = effects.crumbsEnabled
  if (fxCrumbsMaxInput) fxCrumbsMaxInput.value = `${Math.round(effects.maxCrumbs)}`
  if (fxCrumbsLifeInput) fxCrumbsLifeInput.value = effects.crumbLifeSec.toFixed(2)
  if (fxCrumbsPerInput) fxCrumbsPerInput.value = `${Math.round(effects.crumbsPerEat)}`
  setText(scaleValue, ui.scale.toFixed(2))
  setText(breedValue, activeBreed.nameZh)
  setText(rightValue, `${Math.round(ui.rightMargin)}`)
  setText(sinkValue, `${Math.round(ui.companionSink)}`)
  setText(floorValue, ui.floorAlpha.toFixed(2))
  setText(spotXValue, petting.sweetSpotX.toFixed(2))
  setText(spotYValue, petting.sweetSpotY.toFixed(2))
  setText(spotRadiusValue, petting.sweetSpotRadius.toFixed(2))
  setText(spotGainValue, petting.boostGain.toFixed(2))
  setText(feedMinValue, `${Math.round(feeding.dropMin)}`)
  setText(feedMaxValue, `${Math.round(feeding.dropMax)}`)
  setText(feedCapValue, `${Math.round(feeding.maxActiveTreats)}`)
  setText(feedCdValue, feeding.dropCooldownSec.toFixed(2))
  setText(feedSpeedValue, feeding.speedMultiplier.toFixed(2))
  setText(feedLifeValue, `${Math.round(feeding.despawnSec)}s`)
  setText(feedPauseValue, `${feeding.eatPauseSec.toFixed(2)}s`)
  setText(fxCrumbsOnValue, effects.crumbsEnabled ? 'on' : 'off')
  setText(fxCrumbsMaxValue, `${Math.round(effects.maxCrumbs)}`)
  setText(fxCrumbsLifeValue, `${effects.crumbLifeSec.toFixed(2)}s`)
  setText(fxCrumbsPerValue, `${Math.round(effects.crumbsPerEat)}`)
}

function catTopY(): number {
  const hiddenOffsetY = currentMode === 'companion' ? ui.companionSink : 0
  return Math.max(-20, stageHeight - stageFloorInset() - baseCatH() + hiddenOffsetY)
}

function updateCatView(): void {
  if (!catShellEl) return
  catShellEl.style.transform = `translate(${catX.toFixed(1)}px, ${catTopY().toFixed(1)}px)`
}

function updateAnchorView(): void {
  if (!teaserAnchorEl) return
  teaserAnchorEl.style.transform = `translate(${anchorX.toFixed(1)}px, ${anchorY.toFixed(1)}px)`
}

function updateFacing(direction: number): void {
  if (!catEl || direction === 0) return
  const next = direction > 0 ? 1 : -1
  if (next === facingDir) return
  facingDir = next
  catEl.style.setProperty('--face-x', `${facingDir}`)
}

function updateTeaserToyStyle(dx: number, dy: number): void {
  if (!teaserAnchorEl) return
  const tilt = Math.max(-28, Math.min(28, dx * 0.28 + dy * 0.12))
  const speed = Math.hypot(dx, dy)
  const trail = Math.max(10, Math.min(28, 10 + speed * 0.35))
  teaserAnchorEl.style.setProperty('--toy-tilt', `${tilt.toFixed(1)}deg`)
  teaserAnchorEl.style.setProperty('--toy-trail', `${trail.toFixed(1)}px`)
}

function updateFeedingAnchorView(): void {
  if (!feedingAnchorEl) return
  const x = Math.min(Math.max(0, pointerX - FEEDING_ANCHOR_WIDTH / 2), Math.max(0, stageWidth - FEEDING_ANCHOR_WIDTH))
  const y = Math.min(Math.max(0, pointerY - FEEDING_ANCHOR_HEIGHT + 2), Math.max(0, stageHeight - FEEDING_ANCHOR_HEIGHT))
  feedingAnchorEl.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
}

function spawnTreatBurst(): void {
  const activeCount = treats.filter((t) => t.eatenAt === null).length
  if (activeCount >= feeding.maxActiveTreats) return
  const room = Math.max(0, feeding.maxActiveTreats - activeCount)
  // Product policy (current release): one treat per drop.
  // Keep feeding tuning fields for future multi-drop unlock.
  const count = Math.min(room, 1)
  if (count <= 0) return
  feedingBoostTimer = FEEDING_CAT_BOOST_TIME
  for (let i = 0; i < count; i += 1) {
    const spread = (Math.random() - 0.5) * 24
    treats.push({
      id: nextTreatId++,
      x: Math.max(4, Math.min(stageWidth - 12, pointerX + spread)),
      y: Math.max(8, pointerY - 8),
      vy: 48 + Math.random() * 24,
      grounded: false,
      spawnedAt: performance.now(),
      eatenAt: null
    })
  }
}

function spawnCrumbs(x: number, y: number): void {
  if (!effects.crumbsEnabled || effects.maxCrumbs <= 0 || effects.crumbsPerEat <= 0) return
  const room = Math.max(0, effects.maxCrumbs - crumbs.length)
  const count = Math.min(room, effects.crumbsPerEat)
  for (let i = 0; i < count; i += 1) {
    crumbs.push({
      id: nextTreatId++,
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 10,
      ttl: effects.crumbLifeSec * (0.85 + Math.random() * 0.35),
      life: effects.crumbLifeSec
    })
  }
}

function updateTreatsAndFeeding(dt: number): void {
  const floorY = stageHeight - stageFloorInset() - 8
  for (const t of treats) {
    if (t.eatenAt !== null) continue
    if (!t.grounded) {
      t.vy += feeding.gravity * dt
      t.y += t.vy * dt
      if (t.y >= floorY) {
        t.y = floorY
        t.vy = 0
        t.grounded = true
      }
    }
  }

  if (currentMode === 'feeding') {
    const activeTreats = treats.filter((t) => t.eatenAt === null)
    // Keep scene-03 stable while eat window is active; no retarget/start insertion.
    if (feedingEatTimer > 0) {
      feedingAnimState = 'eat'
      feedingVelocityX = approach(feedingVelocityX, 0, feedingAccel() * dt * 2)
      feedingBoostTimer = 0
    } else if (activeTreats.length > 0) {
      if (feedingPauseTimer > 0) {
        feedingAnimState = 'eat'
        feedingVelocityX = approach(feedingVelocityX, 0, feedingAccel() * dt * 2)
        feedingBoostTimer = 0
      } else {
      const catCenterX = catX + baseCatW() / 2
      let nearest = activeTreats[0]!
      let nearestDist = Math.abs(nearest.x - catCenterX)
      for (const t of activeTreats) {
        const d = Math.abs(t.x - catCenterX)
        if (d < nearestDist) {
          nearest = t
          nearestDist = d
        }
      }
      if (feedingTargetId !== nearest.id) {
        feedingTargetId = nearest.id
        feedingAnimState = 'start'
        feedingWalkStartTimer = 0.52
      }
      targetX = clampTargetX(nearest.x - baseCatW() / 2)
      const delta = targetX - catX
      const absDelta = Math.abs(delta)
      const moveDir = Math.sign(delta)
      if (absDelta > 12) {
        if (feedingAnimState === 'eat' || feedingAnimState === 'hold') {
          feedingAnimState = 'loop'
        } else if (feedingAnimState === 'start') {
          feedingWalkStartTimer = Math.max(0, feedingWalkStartTimer - dt)
          if (feedingWalkStartTimer <= 0) feedingAnimState = 'loop'
        }
      } else if (feedingAnimState === 'start') {
        feedingWalkStartTimer = Math.max(0, feedingWalkStartTimer - dt)
        if (feedingWalkStartTimer <= 0) feedingAnimState = 'loop'
      }
      const speedRatio = Math.min(1, absDelta / FEEDING_CAT_SLOWDOWN_DISTANCE)
      const easedRatio = speedRatio * speedRatio * (3 - 2 * speedRatio)
      feedingBoostTimer = Math.max(0, feedingBoostTimer - dt)
      const baseSpeed = feedingMaxSpeed() * (0.2 + 0.8 * easedRatio)
      const targetSpeed = feedingBoostTimer > 0 ? Math.max(baseSpeed, feedingBoostSpeed()) : baseSpeed
      const targetVelocity = moveDir * targetSpeed
      feedingVelocityX = approach(feedingVelocityX, targetVelocity, feedingAccel() * dt)
      // Feeding GIFs are authored facing left by default; invert move dir for mirror logic.
      updateFacing(-moveDir)
      if (absDelta < 5) {
        catX = targetX
        feedingVelocityX = approach(feedingVelocityX, 0, feedingAccel() * dt * 1.5)
      } else {
        catX = clampTargetX(catX + feedingVelocityX * dt)
      }

      for (const t of activeTreats) {
        if (!t.grounded) continue
        const d = Math.abs(t.x - (catX + baseCatW() / 2))
        if (d < 16 && feedingAnimState !== 'start') {
          t.eatenAt = performance.now()
          feedingAnimState = 'eat'
          happyTimer = Math.min(2.5, happyTimer + 0.4)
          feedingEatTimer = Math.max(feedingEatTimer, 0.82)
          feedingPauseTimer = Math.max(feedingPauseTimer, feeding.eatPauseSec)
          spawnCrumbs(catX + baseCatW() * 0.5, catTopY() + baseCatH() * 0.62)
          tryPlaySound('eat', 0.3, 0.8, interactionVolume(0.42))
          tryPlaySound('lick', 0.3, 1.2, interactionVolume(0.34))
        }
      }
      }
    } else {
      feedingTargetId = null
      if (feedingAnimState === 'eat' || feedingAnimState === 'hold' || feedingEatTimer > 0) {
        feedingAnimState = 'hold'
      }
      feedingVelocityX = approach(feedingVelocityX, 0, feedingAccel() * dt)
      feedingBoostTimer = 0
      feedingPauseTimer = 0
    }
    if (feedingAnimState === 'eat' && feedingEatTimer <= 0 && activeTreats.length === 0) {
      feedingAnimState = 'hold'
    }
  } else {
    feedingTargetId = null
    feedingAnimState = 'none'
    feedingWalkStartTimer = 0
    feedingVelocityX = approach(feedingVelocityX, 0, feedingAccel() * dt)
    feedingBoostTimer = 0
    feedingPauseTimer = 0
  }

  const now = performance.now()
  for (let i = treats.length - 1; i >= 0; i -= 1) {
    const t = treats[i]!
    if (t.eatenAt !== null && now - t.eatenAt > 220) treats.splice(i, 1)
    else if (t.eatenAt === null && now - t.spawnedAt > feeding.despawnSec * 1000) treats.splice(i, 1)
  }

  for (let i = crumbs.length - 1; i >= 0; i -= 1) {
    const c = crumbs[i]!
    c.ttl -= dt
    c.y += 26 * dt
    if (c.ttl <= 0) crumbs.splice(i, 1)
  }

  if (treatsLayerEl) {
    const treatHtml = treats
      .map(
        (t) =>
          `<div class="treat${t.eatenAt !== null ? ' eaten' : ''}" style="transform:translate(${t.x.toFixed(1)}px, ${t.y.toFixed(1)}px)"></div>`
      )
      .join('')
    const crumbHtml = crumbs
      .map((c) => {
        const fade = c.ttl < c.life * 0.35 ? ' fade' : ''
        return `<div class="crumb${fade}" style="transform:translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)"></div>`
      })
      .join('')
    treatsLayerEl.innerHTML = treatHtml + crumbHtml
  }
}

function applyEdgeRebound(): void {
  const minX = 0
  const maxX = maxCatX()
  if (catX <= minX) {
    catX = minX
    lastDashDir = 1
    targetX = clampTargetX(minX + 96)
    return
  }
  if (catX >= maxX) {
    catX = maxX
    lastDashDir = -1
    targetX = clampTargetX(maxX - 96)
  }
}

function tick(ts: number): void {
  const dt = Math.max(0, Math.min(0.05, (ts - lastTs) / 1000))
  lastTs = ts

  if (currentMode === 'teaser') {
    if (ts - lastTeaserPointerMoveAt > TEASER_IDLE_TIMEOUT_MS) {
      stopSoundGroup('teaserBell')
    }
    const speed = phaseSpeedPxPerSec(currentPhase)
    const rawDir = Math.sign(targetX - catX)
    const dir = rawDir === 0 ? lastDashDir : rawDir
    if (rawDir !== 0) lastDashDir = rawDir

    const step = speed * dt
    if (Math.abs(targetX - catX) <= step) catX = targetX
    else catX += step * dir
    updateFacing(dir)

    applyEdgeRebound()
    machine.setDistanceToTarget(Math.abs(targetX - catX))
  }

  feedingCooldown = Math.max(0, feedingCooldown - dt)
  feedingEatTimer = Math.max(0, feedingEatTimer - dt)
  feedingPauseTimer = Math.max(0, feedingPauseTimer - dt)
  if (interactionEnabled) updateTreatsAndFeeding(dt)

  pettingHeat = Math.max(0, pettingHeat - dt * 0.8)
  happyTimer = Math.max(0, happyTimer - dt)
  purrCooldown = Math.max(0, purrCooldown - dt)
  const isHappy = currentMode === 'companion' && happyTimer > 0
  if (catShellEl) {
    catShellEl.classList.toggle('petting-hit', pettingHeat > 0.06)
    catShellEl.classList.toggle('petting-happy', isHappy)
    catShellEl.classList.toggle('feeding-run', currentMode === 'feeding' && Math.abs(feedingVelocityX) > 45)
    catShellEl.classList.toggle('feeding-eat', feedingEatTimer > 0)
  }
  catActor?.setFeedingState(currentMode === 'feeding' ? (feedingAnimState === 'none' ? null : feedingAnimState) : null)
  renderMood(isHappy ? 'happy' : 'calm')
  renderHealth()
  catActor?.tick(dt)
  updateCatView()
  updateUserMenuAnchor()
  syncUserMenuVisibility(ts)
  updateAnchorView()
  updateFeedingAnchorView()
  rafId = window.requestAnimationFrame(tick)
}

function onPointerMove(event: MouseEvent): void {
  const dx = event.clientX - lastPointerX
  const dy = event.clientY - lastPointerY
  pointerX = event.clientX
  pointerY = event.clientY
  lastPointerX = event.clientX
  lastPointerY = event.clientY
  lastTeaserPointerMoveAt = performance.now()
  if (isPointerNearCat()) userMenuAutoHideAt = performance.now() + 30000
  if (catDragging) {
    const nextX = clampTargetX(pointerX - catDragOffsetX)
    catX = nextX
    targetX = nextX
    manualCatX = nextX
    updateCatView()
    return
  }
  void syncPointerCapture()
  if (!interactionEnabled || isEventInsideUiPanel(event.target)) return
  anchorX = Math.min(Math.max(0, event.clientX - ANCHOR_WIDTH / 2), Math.max(0, stageWidth - ANCHOR_WIDTH))
  anchorY = clampAnchorY(event.clientY - ANCHOR_HEIGHT / 2)
  updateTeaserToyStyle(dx, dy)
  if (currentMode === 'teaser') {
    if (Math.hypot(dx, dy) > 8) {
      tryPlaySound('teaserBell', 0.3, 1.25, interactionVolume(0.28))
    }
    const now = performance.now()
    if (now < teaserPounceLockUntil) {
      targetX = teaserPounceTargetX
      evaluatePetting(false)
      return
    }
    const teasePointX = anchorX + ANCHOR_WIDTH / 2 + (lastDashDir > 0 ? -6 : 6)
    const candidate = clampTargetX(teasePointX - baseCatW() / 2)
    const nearEnoughForPounce = currentPhase === 'dash' && Math.abs(candidate - catX) < 118
    if (nearEnoughForPounce) {
      teaserPounceTargetX = candidate
      teaserPounceLockUntil = now + 140
      targetX = teaserPounceTargetX
    } else {
      targetX = candidate
    }
  }
  evaluatePetting(false)
}

function updatePettingFx(localX: number, localY: number): void {
  if (!catShellEl || !pettingFxEl) return
  const px = Math.max(0, Math.min(baseCatW() - 14, localX - 7))
  const py = Math.max(0, Math.min(baseCatH() - 14, localY - 7))
  catShellEl.style.setProperty('--petting-fx-transform', `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) scale(1)`)
}

function playPurrFx(localX: number, localY: number): void {
  if (!catShellEl || !purrFxEl) return
  if (purrCooldown > 0) return
  purrCooldown = 0.45
  tryPlaySound('purrSoft', 0.3, 1.5, interactionVolume(0.32))
  const startX = Math.max(8, Math.min(baseCatW() - 30, localX + 8))
  const startY = Math.max(6, Math.min(baseCatH() - 24, localY - 18))
  const endX = startX + (Math.random() > 0.5 ? 8 : -8)
  const endY = Math.max(4, startY - 18)
  catShellEl.style.setProperty('--purr-fx-transform', `translate(${startX.toFixed(1)}px, ${startY.toFixed(1)}px) scale(0.7)`)
  catShellEl.style.setProperty('--purr-fx-transform-end', `translate(${endX.toFixed(1)}px, ${endY.toFixed(1)}px) scale(1.06)`)
  purrFxEl.classList.remove('purr-pop')
  void purrFxEl.offsetWidth
  purrFxEl.classList.add('purr-pop')
}

function evaluatePetting(fromPress: boolean): void {
  if (currentMode !== 'companion' || !pointerDown || !catShellEl) return
  const localX = pointerX - catX
  const localY = pointerY - catTopY()
  if (localX < 0 || localY < 0 || localX > baseCatW() || localY > baseCatH()) return
  const dx = localX / baseCatW() - petting.sweetSpotX
  const dy = localY / baseCatH() - petting.sweetSpotY
  const distance = Math.sqrt(dx * dx + dy * dy)
  if (distance > petting.sweetSpotRadius) return
  const hitStrength = 1 - distance / petting.sweetSpotRadius
  pettingHeat = Math.min(1, pettingHeat + petting.boostGain * hitStrength + (fromPress ? 0.08 : 0))
  happyTimer = Math.min(2.2, happyTimer + 0.45 + hitStrength * 0.35)
  updatePettingFx(localX, localY)
  if (hitStrength > 0.78) tryPlaySound('purrStrong', 0.3, 2.4, interactionVolume(0.38))
  if (hitStrength > 0.35) playPurrFx(localX, localY)
  catShellEl.classList.add('petting-hit')
}

function onPointerDown(event: MouseEvent): void {
  if (!isEventInsideUiPanel(event.target) && userMenuEl?.style.display !== 'none') {
    setUserMenuVisible(false)
  }
  if (event.button !== 0) return
  void syncPointerCapture()
  if (!interactionEnabled || isEventInsideUiPanel(event.target)) return
  if (repositionMode) {
    const top = catTopY()
    if (inRect(event.clientX, event.clientY, catX, top, baseCatW(), baseCatH())) {
      catDragging = true
      catDragOffsetX = event.clientX - catX
      event.preventDefault()
    }
    return
  }
  pointerDown = true
  pointerX = event.clientX
  pointerY = event.clientY
  lastPointerX = event.clientX
  lastPointerY = event.clientY
  if (currentMode === 'feeding' && feedingCooldown <= 0) {
    feedingCooldown = feeding.dropCooldownSec
    spawnTreatBurst()
  }
  evaluatePetting(true)
}

function onPointerUp(): void {
  pointerDown = false
  if (catDragging) {
    catDragging = false
    repositionMode = false
    saveManualCatX()
    syncMoveButtonText()
  }
  void syncPointerCapture()
}

function bindUserEvents(): void {
  userMenuToggleBtn?.addEventListener('contextmenu', (event) => {
    event.preventDefault()
    userMenuPinnedOpen = true
    setUserMenuVisible(true)
    updateUserMenuAnchor()
  })
  userMenuToggleBtn?.addEventListener('click', (event) => {
    event.preventDefault()
  })
  userBreedInput?.addEventListener('change', async () => {
    if (!userBreedInput) return
    await setBreedById(userBreedInput.value)
  })
  userFeedBtn?.addEventListener('click', async () => {
    if (!apiRef) return
    await apiRef.setMode('feeding')
    setUserMenuVisible(false)
  })
  userPetBtn?.addEventListener('click', async () => {
    if (!apiRef) return
    await apiRef.setMode('companion')
    setUserMenuVisible(false)
  })
  userTeaserBtn?.addEventListener('click', async () => {
    if (!apiRef) return
    await apiRef.setMode('teaser')
    setUserMenuVisible(false)
  })
  userMuteBtn?.addEventListener('click', async () => {
    await setMuted(!audioMuted)
  })
  userFeedbackBtn?.addEventListener('click', async () => {
    if (!apiRef) return
    if (feedbackDailyRemaining <= 0) return
    setUserMenuVisible(false)
    const status = await apiRef.openFeedbackWindow()
    feedbackDailyRemaining = status.remainingToday
    syncFeedbackAvailability()
  })
  userLocaleBtn?.addEventListener('click', async () => {
    if (!apiRef) return
    currentLocale = currentLocale === 'zh' ? 'en' : 'zh'
    await apiRef.patchConfig({ locale: currentLocale })
    applyUserMenuLocale()
  })
  userMoveBtn?.addEventListener('click', () => {
    repositionMode = !repositionMode
    catDragging = false
    syncMoveButtonText()
    if (repositionMode) {
      setUserMenuVisible(false)
    }
    void syncPointerCapture()
  })
  userDevUiBtn?.addEventListener('click', () => {
    setDevUiVisible(!devUiVisible)
  })
  userExitBtn?.addEventListener('click', async () => {
    if (!apiRef) return
    const confirmed = window.confirm('确认退出桌宠吗？')
    if (!confirmed) return
    await apiRef.quitApp()
  })
}

async function setBreedById(nextBreedId: string): Promise<void> {
  if (!apiRef) return
  currentBreedId = nextBreedId
  activeBreed = resolveBreedProfile(currentBreedId)
  machine.setProfile(activeBreed.teaser)
  applyUiStyle()
  renderHealth()
  await apiRef.patchConfig({ breedId: currentBreedId })
}

async function setMuted(nextMuted: boolean): Promise<void> {
  if (!apiRef) return
  audioMuted = nextMuted
  syncMuteButtonText()
  const cfg = await apiRef.getConfig()
  await apiRef.patchConfig({
    dnd: {
      ...cfg.dnd,
      muted: nextMuted
    }
  })
}

function bindTunerEvents(): void {
  const onTune = async () => {
    if (!apiRef) return
    if (scaleInput) ui.scale = Number.parseFloat(scaleInput.value)
    if (breedInput) {
      currentBreedId = breedInput.value
      activeBreed = resolveBreedProfile(currentBreedId)
      machine.setProfile(activeBreed.teaser)
    }
    if (rightInput) ui.rightMargin = Number.parseFloat(rightInput.value)
    if (sinkInput) ui.companionSink = Number.parseFloat(sinkInput.value)
    if (floorInput) ui.floorAlpha = Number.parseFloat(floorInput.value)
    if (spotXInput) petting.sweetSpotX = Number.parseFloat(spotXInput.value)
    if (spotYInput) petting.sweetSpotY = Number.parseFloat(spotYInput.value)
    if (spotRadiusInput) petting.sweetSpotRadius = Number.parseFloat(spotRadiusInput.value)
    if (spotGainInput) petting.boostGain = Number.parseFloat(spotGainInput.value)
    if (feedMinInput) feeding.dropMin = Number.parseFloat(feedMinInput.value)
    if (feedMaxInput) feeding.dropMax = Number.parseFloat(feedMaxInput.value)
    if (feedCapInput) feeding.maxActiveTreats = Number.parseFloat(feedCapInput.value)
    if (feedCdInput) feeding.dropCooldownSec = Number.parseFloat(feedCdInput.value)
    if (feedSpeedInput) feeding.speedMultiplier = Number.parseFloat(feedSpeedInput.value)
    if (feedLifeInput) feeding.despawnSec = Number.parseFloat(feedLifeInput.value)
    if (feedPauseInput) feeding.eatPauseSec = Number.parseFloat(feedPauseInput.value)
    if (fxCrumbsOnInput) effects.crumbsEnabled = fxCrumbsOnInput.checked
    if (fxCrumbsMaxInput) effects.maxCrumbs = Number.parseFloat(fxCrumbsMaxInput.value)
    if (fxCrumbsLifeInput) effects.crumbLifeSec = Number.parseFloat(fxCrumbsLifeInput.value)
    if (fxCrumbsPerInput) effects.crumbsPerEat = Number.parseFloat(fxCrumbsPerInput.value)
    applyUiPatch(ui)
    applyPettingPatch(petting)
    applyFeedingPatch(feeding)
    applyEffectsPatch(effects)

    catX = defaultCompanionX()
    if (currentMode === 'companion') targetX = catX
    applyUiStyle()
    updateCatView()
    updateAnchorView()
    renderHealth()
    await apiRef.patchConfig({
      breedId: currentBreedId,
      ui: { ...ui },
      petting: { ...petting },
      feeding: { ...feeding },
      effects: { ...effects }
    })
  }

  scaleInput?.addEventListener('input', onTune)
  breedInput?.addEventListener('input', onTune)
  rightInput?.addEventListener('input', onTune)
  sinkInput?.addEventListener('input', onTune)
  floorInput?.addEventListener('input', onTune)
  spotXInput?.addEventListener('input', onTune)
  spotYInput?.addEventListener('input', onTune)
  spotRadiusInput?.addEventListener('input', onTune)
  spotGainInput?.addEventListener('input', onTune)
  feedMinInput?.addEventListener('input', onTune)
  feedMaxInput?.addEventListener('input', onTune)
  feedCapInput?.addEventListener('input', onTune)
  feedCdInput?.addEventListener('input', onTune)
  feedSpeedInput?.addEventListener('input', onTune)
  feedLifeInput?.addEventListener('input', onTune)
  feedPauseInput?.addEventListener('input', onTune)
  fxCrumbsOnInput?.addEventListener('input', onTune)
  fxCrumbsMaxInput?.addEventListener('input', onTune)
  fxCrumbsLifeInput?.addEventListener('input', onTune)
  fxCrumbsPerInput?.addEventListener('input', onTune)
  interactionToggleBtn?.addEventListener('click', () => {
    interactionEnabled = !interactionEnabled
    pointerDown = false
    applyModeToMachine(currentMode)
    syncInteractionControls()
    void syncPointerCapture()
  })
  hideTunerBtn?.addEventListener('click', () => {
    setTunerVisible(false)
  })
  uiTunerDockBtn?.addEventListener('click', () => setTunerVisible(true))
  resetButton?.addEventListener('click', async () => {
    if (!apiRef) return
    const confirmed = window.confirm('确认恢复全部配置到默认值吗？\n将重置 UI / 抚摸 / 喂食参数。')
    if (!confirmed) return
    applyUiPatch(DEFAULT_UI_TUNING)
    applyPettingPatch(DEFAULT_PETTING_TUNING)
    applyFeedingPatch(DEFAULT_FEEDING_TUNING)
    applyEffectsPatch(DEFAULT_EFFECTS_TUNING)
    currentBreedId = 'chinese-garden'
    activeBreed = resolveBreedProfile(currentBreedId)
    machine.setProfile(activeBreed.teaser)
    crumbs.length = 0
    catX = defaultCompanionX()
    if (currentMode === 'companion') targetX = catX
    applyUiStyle()
    updateCatView()
    updateAnchorView()
    renderHealth()
    await apiRef.patchConfig({
      breedId: currentBreedId,
      ui: { ...ui },
      petting: { ...petting },
      feeding: { ...feeding },
      effects: { ...effects }
    })
  })
}

function bindTunerDragEvents(): void {
  if (!uiPanelEl || !uiPanelHeadEl) return
  uiPanelHeadEl.addEventListener('mousedown', (event) => {
    if (event.target instanceof Element && event.target.closest('.tuner-actions')) return
    panelDragging = true
    panelDragOffsetX = event.clientX - (Number.parseFloat(uiPanelEl.style.left) || 10)
    panelDragOffsetY = event.clientY - (Number.parseFloat(uiPanelEl.style.top) || 8)
    event.preventDefault()
  })
  window.addEventListener('mousemove', (event) => {
    if (!panelDragging) return
    applyPanelPosition(event.clientX - panelDragOffsetX, event.clientY - panelDragOffsetY)
  })
  window.addEventListener('mouseup', () => {
    if (!panelDragging) return
    panelDragging = false
    savePanelPosition()
  })
}

async function boot(): Promise<void> {
  const api = window.desktopCat
  if (!api) {
    setText(label, 'preload 未注入（请用 electron-vite dev 启动）')
    return
  }

  apiRef = api
  const [layout, config, runtime] = await Promise.all([api.getStageLayout(), api.getConfig(), api.getRuntime()])
  const feedbackStatus = await api.getFeedbackStatus()

  applyUiPatch(config.ui)
  applyPettingPatch(config.petting)
  applyFeedingPatch(config.feeding)
  applyEffectsPatch(config.effects)
  syncInteractionControls()
  syncMoveButtonText()
  setDevUiVisible(false)
  setTunerVisible(false)
  setUserMenuVisible(false)
  feedbackDailyRemaining = feedbackStatus.remainingToday
  syncFeedbackAvailability()
  userMenuAutoHideAt = performance.now() + 30000
  stageWidth = layout.windowWidth
  stageHeight = layout.windowHeight
  loadManualCatX()
  loadPanelPosition()
  catX = defaultCompanionX()
  targetX = catX
  anchorX = catX
  anchorY = clampAnchorY(stageHeight * 0.42)
  lastPointerX = anchorX
  lastPointerY = anchorY

  document.documentElement.style.setProperty('--floor-h', `${layout.bottomInsetPx}px`)
  const innerH = layout.windowHeight - layout.bottomInsetPx
  setText(label, `舞台 ${layout.windowWidth}×${layout.windowHeight}px · 可用高度≈ ${innerH}px`)

  renderConfig(config)
  renderRuntime(runtime)
  renderHealth()
  applyUiStyle()
  updateCatView()
  updateAnchorView()
  updateFeedingAnchorView()
  await syncPointerCapture()

  const offPhase = machine.subscribe(renderPhase)
  const offMode = api.onModeChanged((mode: AppMode) => {
    setText(modeLabel, `当前模式 · ${modeLabelText(mode)}`)
    applyModeToMachine(mode)
    renderHealth()
  })
  const offConfig = api.onConfigChanged((next) => {
    renderConfig(next)
    applyPettingPatch(next.petting)
    applyFeedingPatch(next.feeding)
    applyEffectsPatch(next.effects)
    applyUiStyle()
    updateCatView()
    updateAnchorView()
    renderHealth()
  })
  const offRuntime = api.onRuntimeChanged((next) => renderRuntime(next))

  bindTunerEvents()
  bindTunerDragEvents()
  bindUserEvents()
  window.addEventListener('mousemove', onPointerMove)
  window.addEventListener('mousedown', onPointerDown)
  window.addEventListener('mouseup', onPointerUp)
  window.addEventListener('contextmenu', (event) => {
    if (isEventInsideUiPanel(event.target)) event.preventDefault()
  })
  await api.setMode('companion')

  window.addEventListener('keydown', async (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'q') {
      event.preventDefault()
      await api.quitApp()
      return
    }
    if (event.key.toLowerCase() === 'm') {
      await setMuted(!audioMuted)
      return
    }
    if (event.key.toLowerCase() === 'f') {
      if (feedbackDailyRemaining <= 0) return
      const status = await api.openFeedbackWindow()
      feedbackDailyRemaining = status.remainingToday
      syncFeedbackAvailability()
      return
    }
    if (event.key.toLowerCase() === 'g') {
      repositionMode = !repositionMode
      catDragging = false
      syncMoveButtonText()
      setUserMenuVisible(false)
      void syncPointerCapture()
      return
    }
    if (event.key === 'F10') {
      const current = await api.getRuntime()
      await api.setFullscreenPaused(!current.flags.fullscreenPaused)
      return
    }
    if (event.key === 'F9') {
      await api.setMode('teaser')
      return
    }
    if (event.key === 'F8') {
      await api.setMode('feeding')
      return
    }
    if (event.key === 'Escape') {
      await api.setMode('companion')
      return
    }
    if (event.key.toLowerCase() === 'u' && event.shiftKey) {
      setDevUiVisible(!devUiVisible)
      return
    }
    if (event.key.toLowerCase() === 'u' && devUiVisible) {
      const hidden = uiPanelEl?.style.display === 'none'
      setTunerVisible(hidden)
    }
  })

  lastTs = performance.now()
  rafId = window.requestAnimationFrame(tick)

  window.addEventListener('beforeunload', () => {
    void api.setPointerCapture(false)
    if (rafId !== null) window.cancelAnimationFrame(rafId)
    window.removeEventListener('mousemove', onPointerMove)
    window.removeEventListener('mousedown', onPointerDown)
    window.removeEventListener('mouseup', onPointerUp)
    offMode()
    offConfig()
    offRuntime()
    offPhase()
  })
}

void boot()
