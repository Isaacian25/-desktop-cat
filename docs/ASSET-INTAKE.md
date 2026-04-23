# Asset Intake (GIF-first)

This project currently supports a GIF-first intake workflow with safe rollback.

## Idle GIF Intake (current test batch)

Upload path:

- `src/renderer/public/cats/chinese-garden/idle-gif-sources/`

Required filenames for the 3-scene idle test:

- `idle_scene_01.gif`
- `idle_scene_02.gif`
- `idle_scene_03.gif`

## Feeding (Eat) Action Intake

Runtime action folder:

- `src/renderer/public/cats/chinese-garden/eat/start/`
- `src/renderer/public/cats/chinese-garden/eat/loop/`
- `src/renderer/public/cats/chinese-garden/eat/eat/`

Required naming:

- `start_0001.png`, `start_0002.png`, ...
- `loop_0001.png`, `loop_0002.png`, ...
- `eat_0001.png`, `eat_0002.png`, ...

Notes:

- GIF intake folder: `src/renderer/public/cats/chinese-garden/eat-gif-sources/`
- Expected source GIF names:
  - `eat_scene_01.gif` (起步)
  - `eat_scene_02.gif` (行走循环，可按路径长度循环)
  - `eat_scene_03.gif` (到位吃冻干)
- Runtime is wired as: `start -> loop (repeat) -> eat`.

## Safety Rollback

Before replacing runtime idle frames, keep source backup under:

- `assets-backup/<date>/chinese-garden/idle-original/`

Current backup baseline:

- `assets-backup/2026-04-13/chinese-garden/idle-original/`

## Replacement Flow

1. Place 3 GIF files in `idle-gif-sources/`.
2. Extract frames scene-by-scene into `src/renderer/public/cats/chinese-garden/idle/`.
3. Use ordered naming `idle_0001.png`, `idle_0002.png`, ...
4. Run `npm run typecheck` and a runtime visual pass.
5. If visual regression occurs, restore PNGs from backup baseline.
