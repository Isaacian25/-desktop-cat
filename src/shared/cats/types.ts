export type TeaserBehaviorProfile = {
  triggerDistance: number
  lostDistance: number
  reengageDistance: number
  stalkMs: number
  windupMs: number
  dashMs: number
  speedStalk: number
  speedWindup: number
  speedDash: number
}

export type BreedProfile = {
  id: string
  nameZh: string
  noveltyLabel: string
  teaser: TeaserBehaviorProfile
}
