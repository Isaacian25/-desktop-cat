# Release Self-Check Checklist

Use this checklist before marking a development cycle as stable.

## Run Metadata (required)

- **Date**:
- **Owner**:
- **Branch/Commit**:
- **Target Release**:
- **Scope**:

## P0 Stability Gates (must pass)

- [ ] **Single-instance gate**: launching `npm run dev` twice does not create multiple app instances.
- [ ] **Process hygiene**: app can be fully closed; no residual `desktop-cat` Electron process remains after shutdown.
- [ ] **Build integrity**: `npm run verify` passes (`typecheck + build`).
- [ ] **Mode hotkeys**: `F8`/`F9`/`Esc` all switch to expected mode.
- [ ] **UI safety loop**: tuner supports show/hide/reopen cycle and does not permanently block interaction.
- [ ] **Effects isolation**: enabling/disabling new effects does not break existing modes (`companion` / `teaser` / `feeding`).

## P1 Interaction Gates

- [ ] **Feeding bounds**: active treats never exceed configured cap.
- [ ] **Treat lifecycle**: uneaten treats despawn by configured timeout.
- [ ] **Pointer capture sanity**: health indicator updates `capture` state correctly near UI/cat regions.
- [ ] **Layer non-intrusive gate**: in `feeding` mode pointer capture is localized (near cat/treat), not full-stage global capture.
- [ ] **Interaction zone gate**: default interaction capture is constrained to cat-centered `300x200` zone.
- [ ] **Menu blank-close gate**: when menu is open, clicking any blank screen area closes menu reliably.
- [ ] **Petting feedback**: sweet-spot interaction can trigger happy state and heart effect.
- [ ] **Crumb safety budget**: crumb count respects cap and auto-clears by lifecycle timeout.
- [ ] **Teaser bell asset sanity**: no invalid bell slot path in active sound bank configuration.
- [ ] **Asset rollback completeness**: when rolling back scale tests, restore frame files from backup directory (not code-only rollback).

## Incident Regression (mandatory)

- [ ] **INC-2026-04-14 duplicate instance regression passed** (`docs/INCIDENT-2026-04-14-duplicate-instances.md`).

## Reporting Format

For each failed item, record:

1. Reproduction steps
2. Observed behavior
3. Expected behavior
4. Suspected layer (`main` / `preload` / `renderer`)

## Release Report Template (copy and fill)

```md
## Self-Check Report — [Release/Build] — [YYYY-MM-DD]

### Metadata
- Owner:
- Branch/Commit:
- Scope:

### Result
- P0: [x]/5 passed
- P1: [x]/4 passed
- Incident regressions: [x]/1 passed

### Failed Items
1. [ID] ...
   - Reproduction:
   - Observed:
   - Expected:
   - Suspected layer:

### Notes
- ...
```

## Execution History

| Date | Owner | Target Release | P0 | P1 | Incident Regression | Result | Notes |
|------|-------|----------------|----|----|---------------------|--------|-------|
| 2026-04-14 | Codex | Dev baseline | 5/5 | 4/4 | 1/1 | Pass | Added duplicate-instance guard and archived incident |
| 2026-04-14 | Codex | Stabilization pass | 6/6 | 5/5 | 1/1 | Pass | Added effects isolation controls, feed eat-pause tuning, verify:dev workflow |
