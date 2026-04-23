# Desktop Cat Compact

Last updated: 2026-04-13

## 1) Product Intent (one line)

Create a lightweight, local-first desktop cat companion with low-cognitive user UX and configurable developer controls.

## 2) Core Scope Locked

- Runtime: local-only, no network required during normal usage.
- Platform: Electron MVP.
- Primary interactions: companion, teaser, feeding, petting sweet spot.
- User UI: lightweight menu-first interaction.
- Dev UI: hidden HUD/tuner, separated from user UI.

## 3) Architecture Snapshot

- `src/main`: window lifecycle, global shortcuts, tray, config persistence, feedback store.
- `src/preload`: safe bridge API.
- `src/renderer`: cat actor, interaction state machine, user/dev UI, pointer capture policy.
- `src/shared`: single source for IPC channels, types, defaults/migration, breed profiles.

## 4) Key Evolution Milestones

1. Established extensible scaffold (`shared` contracts + versioned config + migration).
2. Delivered cat behavior loop (`stalk -> windup -> dash`) and feeding/petting modes.
3. Added robust click-through/capture model to reduce UI conflicts.
4. Stabilized runtime with single-instance lock (duplicate-window incident fixed).
5. Introduced user-facing menu and in-app exit path.
6. Added effects/audio slots + randomized trigger strategy.
7. Added local-first feedback pipeline (NDJSON).
8. Split feedback into dedicated centered window (independent from pet stage).

## 5) Stability Decisions Already Applied

- D-001 Electron MVP
- D-002 Offline-first runtime
- D-003 Config-driven extensibility
- D-004 Shared IPC contracts
- D-005 Stability-first delivery rhythm
- D-006 Runtime overlay for fullscreen pause
- D-007 Conservative fullscreen detector
- D-008 Single-instance runtime enforcement

See `docs/DECISIONS.md` for details.

## 6) Current Known Focus (next optimization track)

- Reduce perceived layer interference (pet vs active user app).
- Keep drag support while preserving non-intrusive pointer behavior.
- Continue hardening feedback window sizing + interaction reliability.

## 7) Source of Truth Index

- Architecture: `docs/ARCHITECTURE.md`
- Decisions: `docs/DECISIONS.md`
- Regression gates: `docs/SELFCHECK.md`
- Incident archive: `docs/INCIDENT-2026-04-14-duplicate-instances.md`
- Audio spec: `docs/SOUNDS.md`
- Delivery changes: `CHANGELOG.md`
- Rolling iteration log: `docs/WORKLOG.md`
