# Decisions Log

## D-001 Electron for MVP

- **Status**: Accepted
- **Why**: Fast iteration for transparent desktop window + tray + IPC.
- **Tradeoff**: Heavier runtime than Tauri.

## D-002 Offline-first Runtime

- **Status**: Accepted
- **Why**: Desktop pet should run without network dependency.
- **Scope**: Gameplay/state/config are local-only. Network is only for install/update.

## D-003 Config-driven extensibility

- **Status**: Accepted
- **Why**: Future cat breeds and personality behavior should be data-driven.
- **Implementation**: `UserConfig` + migration entrypoint + shared types.

## D-004 Single source IPC contracts

- **Status**: Accepted
- **Why**: Avoid channel drift and typing mismatch between main/preload/renderer.
- **Implementation**: `src/shared/ipc.ts` and shared type imports.

## D-005 Stability before feature velocity

- **Status**: Accepted
- **Why**: Core UX depends on deterministic window behavior and state flow.
- **Execution**: Build service modules first, then implement interactions.

## D-006 Runtime overlay for auto-pause

- **Status**: Accepted
- **Why**: Fullscreen auto-pause should not overwrite persistent user preference (`dnd.pauseInteraction`).
- **Implementation**: Keep ephemeral runtime flags (`fullscreenPaused`) and compute effective pause from config + runtime.

## Next Candidate Decisions

- Platform-specific fullscreen detection strategy
- Click-through model granularity (whole-window vs region-aware)
- Save backup/export format (`json` vs packaged archive)

## D-007 Conservative fullscreen detector

- **Status**: Accepted
- **Why**: Native cross-platform fullscreen detection is inconsistent in MVP scope.
- **Implementation**: Use conservative heuristic watcher and keep detection module isolated for future replacement.

## D-008 Enforce single-instance runtime

- **Status**: Accepted
- **Why**: Prevent duplicate app instance accumulation and unclosable-test regressions.
- **Implementation**: `app.requestSingleInstanceLock()` at startup with immediate exit on lock failure; focus existing window on `second-instance`.
