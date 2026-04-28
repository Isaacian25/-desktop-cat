# Desktop Cat Worklog

Purpose: lightweight, append-only iteration log for traceable development.

## How to Use

- Add one entry per meaningful implementation batch.
- Keep each entry short: objective -> changes -> verification -> risk/next.
- Link to deeper docs (incident/decision/changelog) when needed.
- Never rewrite history; only append.

## Entry Template

```md
## [YYYY-MM-DD] [Tag] Short title
- Objective:
- Changes:
  - ...
- Verification:
  - ...
- Follow-up:
  - ...
```

---

## [2026-04-13] [ARCH] Long-term scalable skeleton

- Objective: establish maintainable MVP foundation before feature expansion.
- Changes:
  - Introduced shared type/contracts and versioned config migration path.
  - Split responsibilities across main/preload/renderer/services.
- Verification:
  - Build/typecheck baseline passed.
- Follow-up:
  - Continue feature delivery on top of stable contract layer.

## [2026-04-14] [STABILITY] Duplicate instance incident fix

- Objective: stop runaway multi-instance growth during dev/test.
- Changes:
  - Added `app.requestSingleInstanceLock()` and `second-instance` focusing flow.
  - Archived incident + embedded into self-check gates.
- Verification:
  - `npm run verify` passed.
  - Repeat launch no longer spawns uncontrolled extra windows.
- Follow-up:
  - Keep process hygiene checks as P0 gate.

## [2026-04-14] [UX] User/developer UI separation

- Objective: keep user interaction simple while preserving tuning tools.
- Changes:
  - User menu streamlined to interaction essentials + in-app exit.
  - Dev HUD/tuner hidden by default (`Shift+U` / `U` controls).
- Verification:
  - Manual mode-switch and panel visibility loop tested.
- Follow-up:
  - Ongoing text and menu structure refinement.

## [2026-04-14] [INTERACTION] Feeding/petting/audio polish

- Objective: improve realism and reduce noise fatigue.
- Changes:
  - Eased feeding chase movement and tuned speed profile.
  - Added treat cap + despawn lifecycle.
  - Added sound slot system with probabilistic triggers and mute toggle.
- Verification:
  - Runtime behavior checks on feeding cap/despawn and mode transitions.
- Follow-up:
  - Continue balancing perceived responsiveness vs non-intrusiveness.

## [2026-04-14] [OPERATIONS] Local feedback pipeline

- Objective: enable product operation loop for bug/idea collection.
- Changes:
  - Added in-app feedback entry and local NDJSON persistence.
  - Added daily submit cap (1/day) + disabled state and tooltip feedback.
- Verification:
  - Typecheck/build passed; feedback records persisted locally.
- Follow-up:
  - Add optional aggregation/reporting tool for operations view.

## [2026-04-14] [UI] Feedback window decoupling and reliability hardening

- Objective: move feedback UI out of pet-stage constraints and improve reliability.
- Changes:
  - Moved feedback to dedicated centered window.
  - Added window sizing diagnostics and fit-content attempts with fallback.
  - Simplified controls to close-only in custom top-right action area.
- Verification:
  - Typecheck passed; interaction binding fallback added.
- Follow-up:
  - Finalize content-fit behavior against real-device visual baseline.

## [2026-04-14] [LAYERING] Non-intrusive pointer capture + explicit reposition mode

- Objective: reduce pet interference with active user app while preserving drag capability.
- Changes:
  - Tightened pointer capture policy (no broad capture on visible paw toggle).
  - Added explicit `移动位置` mode (`G`) with drag-and-save behavior.
- Verification:
  - Typecheck passed.
- Follow-up:
  - Validate real-world interference reduction and adjust capture granularity.

## [2026-04-13] [UI-ASSET] Teaser stick visual replacement test

- Objective: test replacing procedural teaser toy with user-provided art asset.
- Changes:
  - Imported user asset to `src/renderer/public/ui/teaser-stick-v1.png`.
  - Imported original zipped GIF and added `src/renderer/public/ui/teaser-stick-v1.gif`.
  - Replaced teaser anchor markup from CSS-drawn toy to image-driven presentation.
  - Switched teaser source to use GIF asset for motion playback.
  - Updated teaser anchor sizing/style to fit new art while keeping existing tilt behavior.
- Verification:
  - Typecheck passed.
- Follow-up:
  - Tune GIF anchor offset/scale if runtime visual alignment needs refinement.

## [2026-04-13] [AUDIO] Teaser bell slot integration

- Objective: add pleasant bell feedback to teaser stick motion without causing noise fatigue.
- Changes:
  - Added `teaserBell` sound slot mapping in renderer sound bank.
  - Triggered bell playback only when teaser pointer swing amplitude is significant.
  - Applied probabilistic playback (`30%`) and cooldown (`1.25s`) control.
  - Updated sound spec doc with `teaser_bell_*` contract.
- Verification:
  - Typecheck passed.
- Follow-up:
  - Add real bell assets at `src/renderer/public/sfx/teaser_bell_1.mp3` and `_2.mp3`.

## [2026-04-13] [ASSET-HYGIENE] Teaser GIF replacement and cleanup

- Objective: replace teaser stick animation with optimized version while preventing asset bloat.
- Changes:
  - Replaced teaser visual with latest zip-delivered GIF.
  - Renamed active asset to `src/renderer/public/ui/teaser-stick-primary.gif`.
  - Updated teaser UI reference to new stable filename.
  - Deleted old files (`teaser-stick-v1.gif`, `teaser-stick-v1.png`) and temp extraction folder.
- Verification:
  - Typecheck passed.
- Follow-up:
  - Keep `teaser-stick-primary.gif` as single source of truth for teaser visual.

## [2026-04-13] [AUDIO-TUNING] Interaction volume gain x2

- Objective: increase perceived loudness of cat interaction sounds without breaking audio structure.
- Changes:
  - Added centralized interaction gain constant (`INTERACTION_VOLUME_GAIN = 2.0`).
  - Applied gain helper to cat interaction events: `dash`, `pounceMiss`, `eat`, `lick`, `purrSoft`, `purrStrong`, `teaserBell`.
  - Kept UI open/close sounds unchanged to avoid menu noise inflation.
- Verification:
  - Typecheck passed.
- Follow-up:
  - Run runtime listening pass; if clipping appears on specific assets, reduce per-event base volume.

## [2026-04-13] [ASSET-PIPELINE] Idle GIF intake readiness + rollback baseline

- Objective: prepare safe test path for multi-scene idle GIF upload without losing current production frames.
- Changes:
  - Backed up current idle PNG baseline to `assets-backup/2026-04-13/chinese-garden/idle-original/`.
  - Created intake folder `src/renderer/public/cats/chinese-garden/idle-gif-sources/` for incoming GIF scenes.
  - Added `docs/ASSET-INTAKE.md` with naming, upload path, and rollback flow.
- Verification:
  - Backup folder and intake folder created successfully.
- Follow-up:
  - Wait for `idle_scene_01/02/03.gif` upload, then run extraction + runtime pass.

## [2026-04-13] [ANIMATION] Idle multi-scene GIF replacement test

- Objective: replace idle runtime frames with 3 uploaded GIF scenes while keeping rollback and non-audio impact.
- Changes:
  - Imported `idle_scene_01/02/03.gif` into `idle-gif-sources`.
  - Created second rollback snapshot at `assets-backup/2026-04-13/chinese-garden/idle-pre-gif-replace/`.
  - Extracted sampled frames (8 per scene, total 24) to `src/renderer/public/cats/chinese-garden/idle/idle_0001..0024.png`.
  - Updated idle visual manifest to 24 frames and `fps=8`.
  - No changes to audio slots, audio trigger logic, or sound mix pipeline.
- Verification:
  - Typecheck passed.
- Follow-up:
  - Runtime pass: validate visual smoothness and loop feel; rollback is available if needed.

## [2026-04-13] [ANIMATION-TUNING] Idle size scale +1.4x

- Objective: increase perceived idle cat size after GIF-based frame replacement.
- Changes:
  - Created rollback snapshot `assets-backup/2026-04-13/chinese-garden/idle-pre-scale-1.4/`.
  - Scaled `idle_0001..0024.png` by `1.4x` around center while preserving canvas size.
  - No changes to stalk/windup/dash sequences and no audio changes.
- Verification:
  - Frame batch processed successfully (`24` files).
- Follow-up:
  - Runtime visual pass for final fit against floor/anchor composition.

## [2026-04-13] [REVIEW] Hidden risk sweep + layering capture fix

- Objective: run targeted hidden-issue review and reduce desktop layer interference risk.
- Changes:
  - Completed code sweep for pointer capture, sound slot validity, and build stability (`npm run verify`).
  - Fixed feeding-mode capture scope: now capture is localized (near cat/treat or active press), not unconditional global capture.
  - Fixed teaser bell slot mismatch by removing non-existent `teaser_bell_2` from active sound bank.
  - Extended `docs/SELFCHECK.md` with new gates for layer non-intrusive behavior and teaser bell asset sanity.
- Verification:
  - `npm run verify` passed.
  - `npm run typecheck` passed after fixes.
- Follow-up:
  - Run live interaction pass focused on “active app foreground operation + desktop cat coexistence”.

## [2026-04-13] [LAYERING] Highest layer + constrained interaction zone

- Objective: keep desktop cat on top while reducing interference with active user workflows.
- Changes:
  - Set main desktop-cat window `alwaysOnTop=true` for stable highest-layer presence.
  - Constrained default interaction capture to cat-centered `300x200` zone.
  - Restored full-screen blank-click close behavior while menu is open (global capture during menu-open only).
  - Removed stage visual boundary line (`stage-floor` border hidden).
- Verification:
  - Typecheck passed.
- Follow-up:
  - Live pass for overlap/intersection regressions between menu, feeding treats, and reposition mode.

## [2026-04-13] [ANIMATION] Feeding eat action wiring

- Objective: prepare dedicated feeding consume animation channel before final asset replacement.
- Changes:
  - Imported `eat_scene_01/02/03.gif` into `eat-gif-sources` and split to runtime PNG sets.
  - Upgraded feeding mapping from single clip to staged clips: `start`, `loop`, `eat`.
  - Added renderer actor staged feeding playback API (`setFeedingState`).
  - Wired runtime behavior as `start -> loop (repeat by distance) -> eat`.
  - Added rollback backup at `assets-backup/2026-04-13/chinese-garden/eat-pre-scene-split/`.
  - Updated intake guide with staged feeding naming/path contract.
- Verification:
  - Typecheck passed.
- Follow-up:
  - Runtime tune pass for transition timing (`start` hold duration) after user acceptance.

## [2026-04-13] [ANIMATION-TUNING] Feeding scene sizing + direction + post-eat hold

- Objective: fix feeding scene scale mismatch, mirrored direction behavior, and abrupt post-eat fallback.
- Changes:
  - Applied scene-specific scale: `eat_scene_01(start)=1.2x`, `eat_scene_02(loop)=1.5x`.
  - Corrected horizontal mirror logic: left target uses original orientation, right target mirrors.
  - Added feeding `hold` state to keep the last frame of scene 03 after eating.
  - Extended eat playback window to allow full scene-03 visibility before hold.
- Verification:
  - Typecheck passed.
- Follow-up:
  - Optional future upgrade: if `eat_scene_04` is provided, map hold state to dedicated scene-04 frames.

## [2026-04-13] [ANIMATION-FIX] Feeding start clip guarantee

- Objective: ensure `eat_scene_01(start)` is never skipped when a new treat target is acquired.
- Changes:
  - Added feeding target lock (`feedingTargetId`) and start replay trigger on target switch.
  - Added start protection gate: consume hit cannot jump to `eat` while `start` is still active.
  - Added fallback start timer drain path for short-distance targets.
- Verification:
  - Typecheck passed.
- Follow-up:
  - Runtime check for very short throw distance to confirm start visibility remains natural.

## [2026-04-13] [ANIMATION-TUNING] Feeding eat-lock + walk speed 0.7x

- Objective: prevent `start` insertion during scene-03 playback and improve walking realism with slower locomotion.
- Changes:
  - Added eat-window lock in feeding flow: while `feedingEatTimer > 0`, force `eat` state and block retarget transitions.
  - Added feeding walk speed scale constant (`FEEDING_WALK_SPEED_SCALE = 0.7`) for max speed, accel, and boost.
- Verification:
  - Typecheck passed.
- Follow-up:
  - Runtime pass: validate 03 continuity and assess whether 0.7x needs slight rebound (e.g. 0.75x).

## [2026-04-13] [ANIMATION-TUNING] Feeding scene scale alignment v2

- Objective: align feeding scene visual scale to latest art-direction baseline.
- Changes:
  - Kept `eat_scene_01(start)` at `1.2x` (no change).
  - Updated `eat_scene_02(loop)` to `2.0x`.
  - Updated `eat_scene_03(eat)` to `1.5x`.
- Verification:
  - Frame batch transformation completed successfully.
- Follow-up:
  - Runtime pass for overlap with treats and floor composition.

## [2026-04-13] [ROLLBACK] Feeding runtime scale enforcement

- Objective: rollback runtime transform scaling experiment due to poor visual quality.
- Changes:
  - Removed runtime feeding scene transform enforcement from renderer loop.
  - Restored previous behavior path to keep animation quality baseline stable.
- Verification:
  - Typecheck passed.
- Follow-up:
  - Continue with source GIF quality tuning before next scaling attempt.

## [2026-04-13] [ROLLBACK-FIX] Feeding frame-file scale cleanup

- Objective: fully remove residual scene scaling after runtime rollback.
- Changes:
  - Re-extracted `eat_scene_01/02/03.gif` into `start/loop/eat` frame sets at neutral (1.0) import scale.
  - Overwrote previously scaled frame files, including `scene_02` residual enlargement.
- Verification:
  - Frame regeneration completed successfully.
- Follow-up:
  - Future scale tests should be done from source GIFs with explicit versioned outputs.

## [2026-04-13] [HOTFIX] Feeding loop perceptual size normalization

- Objective: fix user-observed “scene_02 still enlarged” perceptual mismatch.
- Changes:
  - Backed up current loop frames to `assets-backup/2026-04-13/chinese-garden/eat-loop-before-normalize/`.
  - Applied additional centered downscale to `loop_*.png` by `0.82x`.
- Verification:
  - Typecheck passed.
- Follow-up:
  - If still visually large, final correction should be done by source GIF framing adjustment.

## [2026-04-13] [ROLLBACK-FIX] Feeding scene hard reset + direction scope isolation

- Objective: fully reset feeding scenes and fix direction issue without impacting non-feeding flows.
- Changes:
  - Deleted and re-imported `eat_scene_01/02/03.gif` from source zip.
  - Re-split `start/loop/eat` frame sets from clean sources (neutral scale).
  - Scoped direction correction to feeding path only (`updateFacing(-moveDir)`), restored global facing rule for other modes.
- Verification:
  - Typecheck passed.
- Follow-up:
  - Runtime visual pass on feeding left/right targets to confirm mirror behavior is now correct.

## [2026-04-13] [BUGFIX] Feeding drop count hard-lock to 1

- Objective: resolve regression where feeding still dropped 3 treats in runtime tests.
- Changes:
  - Updated shared default config `feeding.dropMax` from `3` to `1`.
  - Added runtime spawn hard-lock (`count=1`) in feeding drop generator for current release policy.
  - Preserved tuning schema for future multi-drop rollout.
- Verification:
  - Typecheck passed.
- Follow-up:
  - Remove hard-lock once product explicitly re-enables multi-drop mode.

## [2026-04-13] [TEASER-TEST] Stalk/Windup/Dash GIF replacement with rollback safety

- Objective: test new teaser GIF assets without changing runtime architecture or risking irreversible regressions.
- Changes:
  - Created rollback snapshot at `assets-backup/2026-04-13/chinese-garden/teaser-pre-test/`.
  - Imported teaser test GIFs from `Teaser.zip`.
  - Replaced runtime teaser frames as:
    - `dash`: sampled to `dash_0001..0010`.
    - `windup-gif`: timeline split into first-half `stalk` and second-half `windup`, each sampled to 6 frames.
  - No state machine or interaction logic changes (assets-only test path).
- Verification:
  - Typecheck passed.
- Follow-up:
  - If visual rhythm is off, rollback from backup and wait for separated stalk/windup sources.

## [2026-04-13] [FEEDING-TEST] Replace only eat_scene_02 and eat_scene_03

- Objective: test newly redrawn feeding loop/eat scenes while preserving scene-01 and existing framework behavior.
- Changes:
  - Backed up current feeding `loop` and `eat` frame folders to `assets-backup/2026-04-13/chinese-garden/eat-0203-pre-replace/`.
  - Replaced source GIFs:
    - `eat-gif-sources/eat_scene_02.gif`
    - `eat-gif-sources/eat_scene_03.gif`
  - Re-split only runtime `loop_*.png` and `eat_*.png` (scene-01/start untouched).
- Verification:
  - Typecheck passed.
- Follow-up:
  - Runtime pass focused on loop continuity and eat hold quality.

## [2026-04-13] [SCALE-TEST] Feed + Teaser frame scale 1.8x

- Objective: test a unified larger visual size for both feeding and teaser scenarios.
- Changes:
  - Backed up `stalk/windup/dash/eat(start|loop|eat)` to:
    - `assets-backup/2026-04-13/chinese-garden/feed-teaser-pre-scale-1.8/`
  - Applied centered `1.8x` scale to all feeding and teaser runtime frame PNGs.
- Verification:
  - Frame transformation completed (`46` frames).
  - Typecheck passed.
- Follow-up:
  - Runtime pass for composition overlap and motion readability.

## [2026-04-13] [SCALE-FIX] Feed/Teaser display-scale enforcement

- Objective: make 1.8x scale visually effective under fixed-canvas `background-size: contain` rendering.
- Changes:
  - Added mode-level display scaling for cat container in `feeding` and `teaser` (`1.8x`).
  - Set `#cat-shell` transform origin to `center bottom` for stable floor anchoring.
- Verification:
  - Typecheck passed.
- Follow-up:
  - Runtime pass for overlap with treats and menu anchor positioning.

## [2026-04-13] [ROLLBACK] Feed/Teaser display-scale enforcement

- Objective: rollback mode-level 1.8x display scaling due to poor visual quality.
- Changes:
  - Removed feed/teaser container display-scale logic from renderer.
  - Restored previous cat container transform behavior.
- Verification:
  - Typecheck passed.
- Follow-up:
  - Future size tuning should prioritize source GIF composition rather than runtime container scaling.

## [2026-04-13] [SELFCHECK-HOTFIX] Scale rollback hard-restore

- Objective: resolve repeated rollback mismatch where visual enlargement persisted after code rollback.
- Changes:
  - Confirmed root cause: frame files remained enlarged after logic rollback.
  - Performed hard restore of `stalk/windup/dash/eat` directories from:
    - `assets-backup/2026-04-13/chinese-garden/feed-teaser-pre-scale-1.8/`
  - Verified no runtime display-scale code path remained.
  - Added self-check gate for asset rollback completeness.
- Verification:
  - `npm run verify` passed.
  - Restored frame counts validated:
    - `stalk=6`, `windup=6`, `dash=10`, `eat(start|loop|eat)=8/8/8`.
- Follow-up:
  - For future scale tests, always pair logic rollback with asset directory restore.

## [2026-04-13] [FEEDING] Single-drop default lock

- Objective: set feeding default to one treat per click while keeping future multi-drop extensibility.
- Changes:
  - Updated feeding default to `dropMin=1`, `dropMax=1`.
  - Added runtime guard to keep single-drop behavior under current product policy.
  - Preserved existing tuning schema for future custom/multi-drop rollout.
- Verification:
  - Typecheck passed.
- Follow-up:
  - When product unlocks multi-drop, remove policy guard and expose UX toggle.

