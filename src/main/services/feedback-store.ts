import { app } from 'electron'
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { FeedbackPayload, FeedbackStatus, RuntimeState, UserConfig } from '../../shared/types'

const FEEDBACK_FILE_NAME = 'desktop-cat-feedback.ndjson'
const DAILY_LIMIT = 1

type PersistedFeedback = {
  id: string
  createdAt: string
  kind: FeedbackPayload['kind']
  message: string
  contact?: string
  context?: {
    mode: RuntimeState['mode']
    breedId: UserConfig['breedId']
    muted: UserConfig['dnd']['muted']
    fullscreenAutoPause: UserConfig['fullscreenAutoPause']
  }
}

function getFeedbackPath(): string {
  return join(app.getPath('userData'), FEEDBACK_FILE_NAME)
}

function getTodayCount(): number {
  const path = getFeedbackPath()
  if (!existsSync(path)) return 0
  const today = new Date().toISOString().slice(0, 10)
  try {
    const text = readFileSync(path, 'utf-8')
    if (!text.trim()) return 0
    const lines = text.split('\n').filter(Boolean)
    let count = 0
    for (const line of lines) {
      try {
        const rec = JSON.parse(line) as { createdAt?: string }
        if (rec.createdAt?.slice(0, 10) === today) count += 1
      } catch {}
    }
    return count
  } catch {
    return 0
  }
}

export function getFeedbackStatus(): FeedbackStatus {
  const submittedToday = getTodayCount()
  return {
    dailyLimit: DAILY_LIMIT,
    submittedToday,
    remainingToday: Math.max(0, DAILY_LIMIT - submittedToday)
  }
}

export function saveFeedback(payload: FeedbackPayload, config: UserConfig, runtime: RuntimeState): { id: string } {
  const status = getFeedbackStatus()
  if (status.remainingToday <= 0) {
    throw new Error('DAILY_LIMIT_REACHED')
  }
  const id = `fb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  const record: PersistedFeedback = {
    id,
    createdAt: new Date().toISOString(),
    kind: payload.kind,
    message: payload.message,
    contact: payload.contact?.trim() || undefined,
    context: payload.includeContext
      ? {
          mode: runtime.mode,
          breedId: config.breedId,
          muted: config.dnd.muted,
          fullscreenAutoPause: config.fullscreenAutoPause
        }
      : undefined
  }

  const path = getFeedbackPath()
  mkdirSync(dirname(path), { recursive: true })
  appendFileSync(path, `${JSON.stringify(record)}\n`, 'utf-8')
  return { id }
}

