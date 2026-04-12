import './style.css'

const label = document.getElementById('layout-label')

async function main(): Promise<void> {
  const api = window.desktopCat
  if (!api) {
    if (label) label.textContent = 'preload 未注入（请用 electron-vite dev 启动）'
    return
  }
  const layout = await api.getStageLayout()
  const innerH = layout.windowHeight - layout.bottomInsetPx
  document.documentElement.style.setProperty('--floor-h', `${layout.bottomInsetPx}px`)
  if (label) {
    label.textContent = `舞台 ${layout.windowWidth}×${layout.windowHeight}px · 可用高度（减底 ${layout.bottomInsetPx}px）≈ ${innerH}px`
  }
}

void main()
