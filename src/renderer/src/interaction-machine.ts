import type { TeaserBehaviorProfile } from '../../shared/cats/types'
import type { ChasePhase } from '../../shared/types'

type Listener = (phase: ChasePhase) => void

type Timers = {
  stalkToWindup: number | null
  windupToDash: number | null
  dashEnd: number | null
}

export class InteractionMachine {
  private phase: ChasePhase = 'idle'
  private readonly listeners = new Set<Listener>()
  private teaserEnabled = false
  private distanceToTarget = Number.POSITIVE_INFINITY
  private profile: TeaserBehaviorProfile

  private timers: Timers = {
    stalkToWindup: null,
    windupToDash: null,
    dashEnd: null
  }

  constructor(profile: TeaserBehaviorProfile) {
    this.profile = profile
  }

  setProfile(profile: TeaserBehaviorProfile): void {
    this.profile = profile
    this.clearTimers()
    this.setPhase('idle')
    this.evaluateTransitions()
  }

  getPhase(): ChasePhase {
    return this.phase
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    listener(this.phase)
    return () => this.listeners.delete(listener)
  }

  setTeaserEnabled(enabled: boolean): void {
    this.teaserEnabled = enabled
    if (!enabled) {
      this.clearTimers()
      this.setPhase('idle')
      return
    }
    this.evaluateTransitions()
  }

  setDistanceToTarget(px: number): void {
    this.distanceToTarget = px
    this.evaluateTransitions()
  }

  private evaluateTransitions(): void {
    if (!this.teaserEnabled) return

    if (this.phase === 'idle' && this.distanceToTarget <= this.profile.triggerDistance) {
      this.enterStalk()
      return
    }

    if (
      (this.phase === 'stalk' || this.phase === 'windup') &&
      this.distanceToTarget >= this.profile.lostDistance
    ) {
      this.clearTimers()
      this.setPhase('idle')
      return
    }

    if (this.phase === 'dash' && this.distanceToTarget < this.profile.reengageDistance) {
      this.enterStalk()
    }
  }

  private enterStalk(): void {
    this.clearTimers()
    this.setPhase('stalk')
    this.timers.stalkToWindup = window.setTimeout(() => {
      this.setPhase('windup')
      this.timers.windupToDash = window.setTimeout(() => {
        this.setPhase('dash')
        this.timers.dashEnd = window.setTimeout(() => {
          this.enterStalk()
        }, this.profile.dashMs)
      }, this.profile.windupMs)
    }, this.profile.stalkMs)
  }

  private clearTimers(): void {
    const ids = Object.values(this.timers)
    for (const id of ids) {
      if (id !== null) window.clearTimeout(id)
    }
    this.timers = {
      stalkToWindup: null,
      windupToDash: null,
      dashEnd: null
    }
  }

  private setPhase(next: ChasePhase): void {
    if (next === this.phase) return
    this.phase = next
    for (const listener of this.listeners) listener(next)
  }
}
