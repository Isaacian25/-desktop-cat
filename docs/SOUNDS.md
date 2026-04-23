# Sound Slots and Audio Spec

This document defines all **sound slots** for Desktop Cat and how to attach audio assets.

## 1. Basics

- **Root folder** for audio assets: `src/renderer/public/sfx/`
- **Supported formats**: `.mp3`, `.ogg`
- **Naming pattern**: `<event>_<index>.mp3`, e.g. `eat_01.mp3`, `purr_soft_02.ogg`
- All slots are **optional** — if no file exists for a slot, the app will skip playback safely.

## 2. Slot Table

### 2.1 Feeding-related

- **eat_***  
  - **Path example**: `src/renderer/public/sfx/eat_01.mp3`  
  - **Trigger**: when the cat successfully eats a treat.  
  - **Default probability**: `0.4` (40% chance).  
  - **Cooldown**: `0.8s`.  
  - **Usage**: short chewing / crunch sounds.

- **lick_***  
  - **Path example**: `src/renderer/public/sfx/lick_01.mp3`  
  - **Trigger**: right after eat, during the short lick-pause.  
  - **Default probability**: `0.3`.  
  - **Cooldown**: `1.2s`.  
  - **Usage**: tongue/lick or very soft mouth movement.

### 2.2 Petting-related

- **purr_soft_***  
  - **Path example**: `src/renderer/public/sfx/purr_soft_01.mp3`  
  - **Trigger**: sweet-spot petting hit, small to medium strength.  
  - **Default probability**: `0.35`.  
  - **Cooldown**: `1.5s`.  
  - **Usage**: gentle purring.

- **purr_strong_***  
  - **Path example**: `src/renderer/public/sfx/purr_strong_01.mp3`  
  - **Trigger**: strong sweet-spot hit / accumulated happy state.  
  - **Default probability**: `0.18`.  
  - **Cooldown**: `2.4s`.  
  - **Usage**: more obvious continuous purring.

### 2.3 Teaser / chase-related

- **dash_***  
  - **Path example**: `src/renderer/public/sfx/dash_01.mp3`  
  - **Trigger**: entering `dash` phase in teaser mode.  
  - **Default probability**: `0.45`.  
  - **Cooldown**: `1.0s`.  
  - **Usage**: soft whoosh/footstep accent.

- **pounce_miss_***  
  - **Path example**: `src/renderer/public/sfx/pounce_miss_01.mp3`  
  - **Trigger**: dash ends with toy escaping (no close contact).  
  - **Default probability**: `0.25`.  
  - **Cooldown**: `1.8s`.  
  - **Usage**: light skid/slide, optional.

- **teaser_bell_***  
  - **Path example**: `src/renderer/public/sfx/teaser_bell_01.mp3`  
  - **Trigger**: teaser mode pointer swing with enough motion amplitude.  
  - **Default probability**: `0.30`.  
  - **Cooldown**: `1.25s`.  
  - **Usage**: soft bell/chime synced with feather sway.

### 2.4 UI feedback (optional)

- **ui_open_***  
  - **Path example**: `src/renderer/public/sfx/ui_open_01.mp3`  
  - **Trigger**: user menu / tuner panel opens.  
  - **Default probability**: `1.0`.  
  - **Cooldown**: `0.3s`.

- **ui_close_***  
  - **Path example**: `src/renderer/public/sfx/ui_close_01.mp3`  
  - **Trigger**: user menu / tuner panel closes.  
  - **Default probability**: `1.0`.  
  - **Cooldown**: `0.3s`.

## 3. How the code uses these

- For each slot family (e.g. `eat_*`), the runtime will:
  - Look under `src/renderer/public/sfx/` for files matching the prefix.
  - Randomly pick **one** file from that family when the event fires.
  - Apply **probability** check and **cooldown** before playback.
- If no matching file exists, the event is silently skipped.

Implementation note: if no sound system is wired yet, this spec still serves as the contract for future wiring and for asset delivery.

## 4. Asset preparation checklist

When adding new audio:

1. Choose a slot from the table above.
2. Place files under `src/renderer/public/sfx/` using the `<event>_<index>.<ext>` pattern.
3. Keep duration short (usually `< 1.5s` for interaction sounds).
4. Normalize loudness so that no single sound is much louder than others.
5. Avoid long silence at the start/end of the file.

Once files are in place, no code change is required — the runtime will automatically pick them up as long as event hooks are enabled in the implementation.

