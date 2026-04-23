# Desktop Cat

A lightweight desktop pet built with Electron.

## Current Status

- Transparent frameless window pinned to the bottom third of the screen
- Versioned local config with migration entrypoint
- IPC protocol shared across main/preload/renderer
- System tray controls for mute/translucency/pause interaction
- Teaser interaction loop with chase phases: `stalk -> windup -> dash`
- Sweet-spot petting feedback in companion mode (hold left mouse and rub cat)

## Development

```bash
npm install
npm run dev
```

If local shell environment has `ELECTRON_RUN_AS_NODE=1`, scripts already clear it automatically.

## Scripts

- `npm run dev` - run in development mode
- `npm run build` - build main/preload/renderer bundles
- `npm run preview` - preview production bundle
- `npm run typecheck` - TypeScript project reference check
- `npm run verify` - typecheck + build (does not open app window)
- `npm run verify:dev` - run verify first, then launch app window

## Controls

- `F8` or `Cmd/Ctrl + 8`: enter feeding mode
- `F9` or `Cmd/Ctrl + 9`: enter teaser mode
- `Esc` or `Cmd/Ctrl + 0`: return to companion mode
- `F10`: toggle fullscreen pause debug flag
- User UI: top-right `🐾` menu for breed selection and in-app exit
- User UI: menu includes in-app feedback submission (`F`)
- `Shift + U`: show/hide developer overlays (HUD + tuner)
- `U` (dev overlay enabled): show/hide UI tuning panel
- Panel loop: `调参` (show) -> `隐藏` (hide) -> `调参` (show again), repeat safely
- Feeding guardrails: active treats capped by `场上上限`; uneaten treats auto-despawn after `冻干存活` seconds
- Tray menu: import/export local config JSON
- Import config auto-creates timestamped `*.bak.json` backup in the same folder before applying

## Locked UI Defaults (Finalized)

- Scale: `1.00`
- Right margin: `35px`
- Companion sink: `60px`
- Floor opacity: `0.00`
- Stage bottom inset: `50px`
- Companion spawn: right side with `50px` logical startup offset, adjusted by current right-margin tuning

Tuning values are persisted in `UserConfig.ui` (main-process config store) and restored on next launch.

`恢复默认（全部）` in the tuner panel resets UI, petting, and feeding tuning to defaults (with confirmation dialog).

## Runtime Tuning Defaults

- Feeding: `dropMin=1`, `dropMax=3`, `maxActiveTreats=12`, `dropCooldownSec=0.16`, `speedMultiplier=1.10`, `despawnSec=8`, `eatPauseSec=0.18`
- Effects (crumbs): `enabled=true`, `maxCrumbs=28`, `crumbLifeSec=0.55`, `crumbsPerEat=5`

## Delivery Regression Checklist

- Launch app with `npm run dev`, confirm desktop cat appears and follows bottom-stage layout
- Verify hotkeys: `F8` feeding, `F9` teaser, `Esc` back to companion, `U` show/hide panel
- Verify panel loop and drag: drag panel, hide, reopen by `调参`, position persists across relaunch
- Verify feeding bounds: treat count never exceeds `场上上限`; uneaten treats disappear after `冻干存活`
- Verify health indicator updates in HUD (`mode`, `treats`, `capture`)
- Run `npm run verify` successfully before delivery

## Documentation

- `docs/ARCHITECTURE.md` - module boundaries and runtime flow
- `docs/COMPACT.md` - compressed project context from day-0 to now
- `docs/DECISIONS.md` - product/engineering decisions and rationale
- `docs/SELFCHECK.md` - release self-check and regression gates
- `docs/INCIDENT-2026-04-14-duplicate-instances.md` - P0 incident archive and fix record
- `docs/SOUNDS.md` - sound slots and audio asset spec
- `docs/ASSET-INTAKE.md` - GIF-first asset upload and rollback intake guide
- `docs/WORKLOG.md` - append-only lightweight iteration log
- `CHANGELOG.md` - release-facing change summary

## Offline-First Principle

Runtime interaction is local-only. Network is only required for package installation and optional app updates.

## Feedback Pipeline (Local-first)

- Users can submit feedback from in-app menu (`反馈建议 / Bug`) or hotkey `F`.
- Feedback is stored locally as NDJSON in app userData:
  - `desktop-cat-feedback.ndjson`
- Each entry includes a generated feedback id and optional runtime context.
