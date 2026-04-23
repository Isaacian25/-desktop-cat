import type { BreedProfile } from './types'

export const CHINESE_GARDEN_CAT_PROFILE: BreedProfile = {
  id: 'chinese-garden',
  nameZh: '中华田园猫',
  noveltyLabel: '高活跃、适应性强',
  teaser: {
    triggerDistance: 300,
    lostDistance: 470,
    reengageDistance: 80,
    stalkMs: 360,
    windupMs: 440,
    dashMs: 3000,
    speedStalk: 170,
    speedWindup: 34,
    speedDash: 700
  }
}

export const ABYSSINIAN_CAT_PROFILE: BreedProfile = {
  id: 'abyssinian',
  nameZh: '阿比西尼亚猫',
  noveltyLabel: '亲人黏人、响应快',
  teaser: {
    triggerDistance: 280,
    lostDistance: 500,
    reengageDistance: 72,
    stalkMs: 280,
    windupMs: 320,
    dashMs: 2600,
    speedStalk: 190,
    speedWindup: 38,
    speedDash: 740
  }
}

export const BENGAL_CAT_PROFILE: BreedProfile = {
  id: 'bengal',
  nameZh: '豹猫',
  noveltyLabel: '高能活跃、爆发强',
  teaser: {
    triggerDistance: 340,
    lostDistance: 520,
    reengageDistance: 96,
    stalkMs: 320,
    windupMs: 360,
    dashMs: 3200,
    speedStalk: 180,
    speedWindup: 40,
    speedDash: 820
  }
}

export const BREED_PROFILES: BreedProfile[] = [
  CHINESE_GARDEN_CAT_PROFILE,
  ABYSSINIAN_CAT_PROFILE,
  BENGAL_CAT_PROFILE
]

export function resolveBreedProfile(id: string): BreedProfile {
  return BREED_PROFILES.find((b) => b.id === id) ?? CHINESE_GARDEN_CAT_PROFILE
}
