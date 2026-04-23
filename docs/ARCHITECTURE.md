# Architecture Baseline (MVP)

## Goal

Keep the Desktop Cat codebase extensible while shipping MVP quickly.

## Layers

### 1) `src/shared`

Shared contracts used by all runtime layers.

- `types.ts`: core domain types (`AppMode`, `UserConfig`, `StageLayout`)
- `cats/`: breed behavior profiles (MVP includes Chinese garden cat teaser tuning)
- `ipc.ts`: IPC channel constants
- `config/defaults.ts`: default config and migration entrypoint

This layer has no Electron-specific side effects.

### 2) `src/main`

Host/process integration and orchestration.

- `index.ts`: app boot, BrowserWindow setup, IPC registration
- `services/stage-layout.ts`: display/workArea to stage layout mapping
- `services/config-store.ts`: local file persistence and patching
- `services/core-bus.ts`: in-process event bus for core domain events
- `services/tray.ts`: tray menu actions and state reflection
- `services/fullscreen-auto-pause.ts`: heuristic fullscreen auto-pause watcher

### 3) `src/preload`

Safe bridge API from Electron main process to renderer.

### 4) `src/renderer`

UI and stage rendering. Only consumes preload API; does not call Electron directly.

- `cat-actor.ts`: runtime sprite driver (manifest based, emoji fallback when frames are missing).

## Runtime Data Flow

1. Main process loads config from local file.
2. Main process creates transparent stage window.
3. Renderer requests stage layout + config via preload API.
4. Any config patch goes through IPC `config:patch`.
5. Main applies side effects (opacity, interaction pause), persists config, and broadcasts `event:configChanged`.

## Extension Rules

- New cross-layer type/API must be defined in `src/shared` first.
- New system capabilities (tray, fullscreen detection, auto-start, etc.) belong to `src/main/services`.
- Renderer should only consume stable preload methods/events.
- Config shape changes must bump migration logic in `src/shared/config/defaults.ts`.


## Runtime Overlay

Auto-pause for fullscreen is tracked as runtime state (`fullscreenPaused`) and then combined with persisted config (`dnd.pauseInteraction`). This avoids mutating user preference when transient environment state changes.
