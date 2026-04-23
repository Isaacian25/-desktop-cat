import type { FeedbackPayload } from '../../shared/types'
import './feedback.css'

const kindInput = document.getElementById('feedback-kind') as HTMLSelectElement | null
const messageInput = document.getElementById('feedback-message') as HTMLTextAreaElement | null
const contactInput = document.getElementById('feedback-contact') as HTMLInputElement | null
const ctxInput = document.getElementById('feedback-ctx') as HTMLInputElement | null
const cancelBtn = document.getElementById('feedback-cancel') as HTMLButtonElement | null
const submitBtn = document.getElementById('feedback-submit') as HTMLButtonElement | null
const windowCloseBtn = document.getElementById('feedback-window-close') as HTMLButtonElement | null

function setControlsDisabled(disabled: boolean): void {
  if (submitBtn) submitBtn.disabled = disabled
  if (cancelBtn) cancelBtn.disabled = disabled
}

async function fitWindowToContentSafe(api: NonNullable<Window['desktopCat']>): Promise<void> {
  if (!api.fitFeedbackWindowToContent) return
  const contentHeight = Math.ceil(document.documentElement.scrollHeight)
  console.info(`[feedback-window] renderer measured contentHeight=${contentHeight}`)
  try {
    await api.fitFeedbackWindowToContent(contentHeight)
  } catch {
    // no-op: keep page usable even if main/preload hot state lags
  }
}

async function boot(): Promise<void> {
  const api = window.desktopCat
  if (!api || !kindInput || !messageInput || !ctxInput) return

  windowCloseBtn?.addEventListener('click', async () => {
    try {
      if (api.closeFeedbackWindow) {
        await api.closeFeedbackWindow()
        return
      }
    } catch {}
    window.close()
  })

  cancelBtn?.addEventListener('click', () => {
    window.close()
  })

  await fitWindowToContentSafe(api)
  window.setTimeout(() => {
    void fitWindowToContentSafe(api)
  }, 80)

  let status
  try {
    status = await api.getFeedbackStatus()
  } catch {
    // If main process handlers are hot-reloading, keep UI interactive.
    messageInput.focus()
    return
  }
  if (status.remainingToday <= 0) {
    window.alert('已达当日最大提交量1条')
    window.close()
    return
  }

  messageInput.focus()

  submitBtn?.addEventListener('click', async () => {
    const message = messageInput.value.trim()
    if (!message) {
      window.alert('请填写反馈内容后再提交。')
      return
    }
    const payload: FeedbackPayload = {
      kind: kindInput.value as FeedbackPayload['kind'],
      message,
      contact: contactInput?.value.trim() || undefined,
      includeContext: ctxInput.checked
    }
    setControlsDisabled(true)
    const res = await api.submitFeedback(payload)
    setControlsDisabled(false)
    if (!res.ok) {
      if (res.reason === 'DAILY_LIMIT_REACHED') {
        window.alert('已达当日最大提交量1条')
      } else {
        window.alert('提交失败，请稍后再试。')
      }
      window.close()
      return
    }
    window.alert(`反馈已提交，编号：${res.id}`)
    window.close()
  })
}

void boot()
