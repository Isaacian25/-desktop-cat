import type { CatVisualManifest } from '../../shared/cats/visuals'
import type { ChasePhase } from '../../shared/types'

export class CatActor {
  private readonly el: HTMLElement
  private readonly visuals: CatVisualManifest
  private currentPhase: ChasePhase = 'idle'
  private frameIndex = 0
  private frameTimerMs = 0
  private feedingState: 'start' | 'loop' | 'eat' | 'hold' | null = null
  private feedingFrameIndex = 0
  private feedingFrameTimerMs = 0
  private currentImage: HTMLImageElement | null = null
  private readonly imageCache = new Map<string, HTMLImageElement>()

  constructor(el: HTMLElement, visuals: CatVisualManifest) {
    this.el = el
    this.visuals = visuals
    this.applyFrame()
  }

  setPhase(phase: ChasePhase): void {
    if (phase === this.currentPhase) return
    this.currentPhase = phase
    this.frameIndex = 0
    this.frameTimerMs = 0
    this.applyFrame()
  }

  setFeedingState(state: 'start' | 'loop' | 'eat' | 'hold' | null): void {
    const resolved = state === 'hold' ? this.visuals.feeding?.eat : state ? this.visuals.feeding?.[state] : null
    const hasAnimation = !!(resolved && resolved.frames.length)
    const next = hasAnimation ? state : null
    if (next === this.feedingState) return
    this.feedingState = next
    this.feedingFrameIndex = next === 'hold' && resolved ? Math.max(0, resolved.frames.length - 1) : 0
    this.feedingFrameTimerMs = 0
    this.applyFrame()
  }

  tick(dtSec: number): void {
    const anim = this.feedingState === 'hold' ? this.visuals.feeding?.eat : this.feedingState ? this.visuals.feeding?.[this.feedingState] : this.visuals.byPhase[this.currentPhase]
    if (!anim) return
    if (this.feedingState === 'hold') return
    if (anim.frames.length <= 1) return
    const frameMs = 1000 / Math.max(1, anim.fps)
    if (this.feedingState) {
      this.feedingFrameTimerMs += dtSec * 1000
      while (this.feedingFrameTimerMs >= frameMs) {
        this.feedingFrameTimerMs -= frameMs
        this.feedingFrameIndex = (this.feedingFrameIndex + 1) % anim.frames.length
        this.applyFrame()
      }
      return
    }
    this.frameTimerMs += dtSec * 1000
    while (this.frameTimerMs >= frameMs) {
      this.frameTimerMs -= frameMs
      this.frameIndex = (this.frameIndex + 1) % anim.frames.length
      this.applyFrame()
    }
  }

  private applyFrame(): void {
    const anim = this.feedingState === 'hold' ? this.visuals.feeding?.eat : this.feedingState ? this.visuals.feeding?.[this.feedingState] : this.visuals.byPhase[this.currentPhase]
    if (!anim) return
    const frameSrc = anim.frames[this.feedingState ? this.feedingFrameIndex : this.frameIndex]
    this.el.style.width = `${this.visuals.width}px`
    this.el.style.height = `${this.visuals.height}px`

    if (!frameSrc) {
      this.currentImage = null
      this.el.style.backgroundImage = 'none'
      this.el.classList.add('shape-fallback')
      return
    }

    this.el.classList.remove('shape-fallback')
    this.el.style.backgroundSize = 'contain'
    this.el.style.backgroundRepeat = 'no-repeat'
    this.el.style.backgroundPosition = 'center'

    const cached = this.imageCache.get(frameSrc)
    if (cached) {
      this.currentImage = cached
      this.el.style.backgroundImage = `url("${frameSrc}")`
      return
    }

    const img = new Image()
    img.onload = () => {
      this.imageCache.set(frameSrc, img)
      if (this.currentImage === img || this.currentImage === null) {
        this.currentImage = img
        this.el.style.backgroundImage = `url("${frameSrc}")`
      }
    }
    img.onerror = () => {
      if (this.currentImage === img || this.currentImage === null) {
        this.currentImage = null
        this.el.style.backgroundImage = 'none'
        this.el.classList.add('shape-fallback')
      }
    }
    this.currentImage = img
    img.src = frameSrc
  }
}
