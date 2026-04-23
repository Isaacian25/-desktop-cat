import { EventEmitter } from 'node:events'
import type { AppMode } from '../../shared/types'

class CoreBus {
  private readonly emitter = new EventEmitter()

  emitModeChanged(mode: AppMode): void {
    this.emitter.emit('modeChanged', mode)
  }

  onModeChanged(listener: (mode: AppMode) => void): () => void {
    this.emitter.on('modeChanged', listener)
    return () => this.emitter.off('modeChanged', listener)
  }
}

export const coreBus = new CoreBus()
