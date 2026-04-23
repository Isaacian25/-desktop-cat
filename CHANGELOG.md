# Changelog

## 2026-04-14

### Added
- UI tuner health status with `mode`, `treats`, `crumbs`, `fx`, and `capture` indicators.
- Full reset confirmation flow for tuner defaults.
- Effects tuning model (`effects`) with crumb controls and safety budget.
- `verify:dev` script for one-command verify then launch.
- Incident archive and release self-check documentation.

### Changed
- Feeding behavior now supports configurable post-eat pause (`feeding.eatPauseSec`) for smoother rhythm.
- Dev/preview scripts now clear `ELECTRON_RUN_AS_NODE` automatically.
- Runtime now enforces single-instance lock to prevent duplicate app windows.

### Fixed
- Prevented duplicate desktop-cat instance growth caused by parallel development launches.
- Restored crumb effect with strict cap + lifecycle cleanup to avoid freeze regressions.
