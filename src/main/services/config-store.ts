import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { defaultConfig, migrateConfig } from '../../shared/config/defaults'
import type { UserConfig } from '../../shared/types'

const CONFIG_FILE_NAME = 'desktop-cat.config.json'

function getConfigPath(): string {
  return join(app.getPath('userData'), CONFIG_FILE_NAME)
}

export function loadConfig(): UserConfig {
  const filePath = getConfigPath()
  if (!existsSync(filePath)) {
    return structuredClone(defaultConfig)
  }
  try {
    const rawText = readFileSync(filePath, 'utf-8')
    const raw = JSON.parse(rawText) as unknown
    return migrateConfig(raw)
  } catch {
    return structuredClone(defaultConfig)
  }
}

export function saveConfig(next: UserConfig): void {
  const filePath = getConfigPath()
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, JSON.stringify(next, null, 2), 'utf-8')
}

export function patchConfig(current: UserConfig, patch: Partial<UserConfig>): UserConfig {
  const next: UserConfig = {
    ...current,
    ...patch,
    dnd: {
      ...current.dnd,
      ...(patch.dnd ?? {})
    },
    ui: {
      ...current.ui,
      ...(patch.ui ?? {})
    },
    petting: {
      ...current.petting,
      ...(patch.petting ?? {})
    },
    feeding: {
      ...current.feeding,
      ...(patch.feeding ?? {})
    },
    effects: {
      ...current.effects,
      ...(patch.effects ?? {})
    }
  }
  saveConfig(next)
  return next
}

export function replaceConfig(raw: unknown): UserConfig {
  const next = migrateConfig(raw)
  saveConfig(next)
  return next
}
