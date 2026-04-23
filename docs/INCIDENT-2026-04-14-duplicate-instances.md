# Incident Report — Duplicate Desktop-Cat Instances

- **Date**: 2026-04-14
- **Severity**: P0
- **Status**: Resolved

## Summary

During development testing, multiple `desktop-cat` windows/process trees were launched and some appeared "unclosable" from normal interaction. Repeated `npm run dev` invocations caused instance accumulation risk and user-facing instability.

## Impact

- Multiple cat windows could coexist unexpectedly.
- Closing behavior became confusing and non-deterministic for manual testers.
- Continued testing risked process buildup and degraded confidence in release stability.

## Detection Signals

- User observed 2-3 simultaneous test instances.
- Process inspection showed more than one `electron-vite dev` + Electron app pair running.
- One older process tree remained as a residue while new runs started.

## Root Cause

1. Development workflow allowed repeated `npm run dev` starts in parallel terminals.
2. App had no single-instance guard, so each launch could create a new Electron app instance.
3. Stale process residues from earlier runs amplified the issue.

## Containment (Immediate)

1. Enumerated and terminated all active `desktop-cat`/Electron related processes.
2. Verified clean state (no remaining app process after cleanup).

## Permanent Fix

Implemented single-instance protection in `src/main/index.ts`:

- Added `app.requestSingleInstanceLock()`.
- If lock acquisition fails, app exits immediately at startup.
- Added `second-instance` handler to focus/show existing main window instead of creating duplicates.

## Verification Evidence

- `npm run verify` passed after patch.
- Duplicate-launch regression test:
  - Start first `npm run dev` instance.
  - Start second `npm run dev` instance.
  - Result: only one Electron app instance remains active.

## Preventive Actions

1. Keep single-instance lock as non-negotiable startup invariant.
2. Keep this incident in the release self-check checklist.
3. For smoke tests, avoid parallel `npm run dev` in multiple terminals unless explicitly testing lock behavior.

## Fast Recovery Command (macOS)

Use only when process residue is suspected:

```bash
ps -ax -o pid=,command= | awk '/Desktop cat\/node_modules\/.bin\/electron-vite dev|Desktop cat\/node_modules\/electron\/dist\/Electron\.app\/Contents\/MacOS\/Electron \./ {print $1}' | xargs kill -TERM
```
