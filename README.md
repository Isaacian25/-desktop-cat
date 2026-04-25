# Desktop Cat

一只本地运行的桌面猫咪（Electron）。

An offline-first desktop cat companion built with Electron.

## 给测试朋友：3分钟上手

### 1) 直接运行（推荐）

- 打开 `release` 目录中的安装包或压缩包
- macOS 可直接使用：
  - `Desktop Cat-0.0.1-arm64.dmg`（安装）
  - `Desktop Cat-0.0.1-arm64-mac.zip`（解压即用）
- 首次若被系统拦截：右键 App -> 打开 -> 再确认一次

### 2) 从源码运行（开发者）

```bash
npm install
npm run dev
```

## Quick Start for Testers (EN)

### 1) Run directly (recommended)

- Open an installer or archive from the `release` directory
- For macOS:
  - `Desktop Cat-0.0.1-arm64.dmg` (install)
  - `Desktop Cat-0.0.1-arm64-mac.zip` (unzip and run)
- If macOS blocks first launch: right-click the app -> Open -> confirm

### 2) Run from source (developers)

```bash
npm install
npm run dev
```

## 交互说明（用户向）

- `右键` 桌面猫附近：打开用户菜单
- `F8`：喂冻干
- `F9`：逗猫棒
- `Esc`：回到陪伴待机
- `M`：静音开关
- `F`：打开反馈窗口
- `Cmd/Ctrl + Q`：退出程序

补充：

- 菜单里可切换猫咪品种、喂食、撸猫、逗猫、静音、退出
- 反馈每天最多提交 1 条，达到上限后入口会置灰

## User Interactions (EN)

- `Right-click` near the desktop cat: open user menu
- `F8`: feeding mode
- `F9`: teaser mode
- `Esc`: back to companion idle mode
- `M`: mute toggle
- `F`: open feedback window
- `Cmd/Ctrl + Q`: quit app

Notes:

- Menu supports breed switch, feeding, petting, teaser, mute, and exit
- Feedback submission is limited to 1 per day (entry becomes disabled after limit)

## 给技术同学

- `npm run verify`：类型检查 + 构建（不启动窗口）
- `npm run dist:mac`：打包 macOS 测试包（`dmg + zip`）

## For Engineers (EN)

- `npm run verify`: typecheck + build (does not launch app window)
- `npm run dist:mac`: package macOS build (`dmg + zip`)

## 文档索引

- `docs/WORKLOG.md`：迭代日志
- `docs/SELFCHECK.md`：自检清单
- `CHANGELOG.md`：版本变更

## Docs Index (EN)

- `docs/WORKLOG.md`: iteration log
- `docs/SELFCHECK.md`: self-check checklist
- `CHANGELOG.md`: release change history
