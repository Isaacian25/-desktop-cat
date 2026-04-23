export const IPC_CHANNELS = {
  stageGetLayout: 'stage:getLayout',
  configGet: 'config:get',
  configPatch: 'config:patch',
  feedbackOpenWindow: 'feedback:openWindow',
  feedbackWindowClose: 'feedback:windowClose',
  feedbackWindowFitContent: 'feedback:windowFitContent',
  feedbackStatus: 'feedback:status',
  feedbackSubmit: 'feedback:submit',
  modeSet: 'mode:set',
  appQuit: 'app:quit',
  runtimeGet: 'runtime:get',
  runtimeSetFullscreenPaused: 'runtime:setFullscreenPaused',
  runtimeSetPointerCapture: 'runtime:setPointerCapture',
  eventModeChanged: 'event:modeChanged',
  eventConfigChanged: 'event:configChanged',
  eventRuntimeChanged: 'event:runtimeChanged'
} as const
