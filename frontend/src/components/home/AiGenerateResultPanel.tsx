import { X, Download, Sparkles, Film, ImageIcon, CircleAlert, Loader2 } from 'lucide-react'
import type { AiGenerateResult } from '@/types'
import { useEffect, useState } from 'react'
import { aiApi } from '@/api'

interface Props {
  result: AiGenerateResult | null
  onClose: () => void
}

export function AiGenerateResultPanel({ result, onClose }: Props) {
  if (!result) return null

  return <AiGenerateResultPanelBody result={result} onClose={onClose} />
}

function AiGenerateResultPanelBody({ result, onClose }: { result: AiGenerateResult; onClose: () => void }) {
  const [current, setCurrent] = useState(result)

  useEffect(() => {
    setCurrent(result)
  }, [result])

  useEffect(() => {
    if (current.status !== 0) return
    const timer = window.setInterval(async () => {
      try {
        const task = await aiApi.getTask(current.taskId)
        if (task.status !== 0) setCurrent((previous) => ({ ...previous, status: task.status, outputUrl: task.outputUrl || previous.outputUrl, message: task.errorMsg || previous.message }))
      } catch { /* 保持当前任务状态，等待下一次轮询 */ }
    }, 1500)
    return () => window.clearInterval(timer)
  }, [current.status, current.taskId])

  const isVideo = current.outputType === 'video'
  const isPending = current.status === 0
  const isFailed = current.status === 2
  const hasOutput = current.status === 1 && Boolean(current.outputUrl)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="animate-fade-in w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-ckt-border px-5 py-4">
          <div className="flex items-center gap-2">
            {isFailed ? (
              <CircleAlert className="h-5 w-5 text-red-500" />
            ) : isVideo ? (
              <Film className="h-5 w-5 text-teal-500" />
            ) : current.outputType === 'agent' ? (
              <Sparkles className="h-5 w-5 text-purple-500" />
            ) : (
              <ImageIcon className="h-5 w-5 text-orange-500" />
            )}
            <div>
              <h3 className="text-base font-semibold text-ckt-text">{isPending ? 'AI 任务处理中…' : current.message}</h3>
              {current.toolName && (
                <p className="text-xs text-ckt-text-secondary">工具：{current.toolName}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ckt-text-secondary transition hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {isPending && (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl bg-[#f7f9fc] text-center">
              <Loader2 className="h-7 w-7 animate-spin text-ckt-primary" />
              <p className="text-sm font-medium text-ckt-text">正在提交给 AI 服务</p>
              <p className="max-w-xs text-xs leading-5 text-ckt-text-secondary">任务完成后会自动显示真实生成结果。</p>
            </div>
          )}

          {isFailed && (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50/60 px-8 text-center">
              <CircleAlert className="h-7 w-7 text-red-500" />
              <p className="text-sm font-medium text-ckt-text">AI 任务未完成</p>
              <p className="max-w-sm text-xs leading-5 text-ckt-text-secondary">{current.message || 'AI 服务暂时不可用，请检查 Provider 配置后重试。'}</p>
            </div>
          )}

          {hasOutput && (
            <div className="relative overflow-hidden rounded-xl bg-gray-50">
              {isVideo ? (
                <video
                  src={current.outputUrl ?? ''}
                  className="w-full bg-black"
                  style={{ maxHeight: 360 }}
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={current.outputUrl ?? ''}
                  alt="生成结果"
                  className="w-full object-cover"
                  style={{ maxHeight: 360 }}
                />
              )}
            </div>
          )}

          {current.steps && current.steps.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-ckt-text-secondary">Agent 执行步骤</p>
              {current.steps.map((step) => (
                <div
                  key={step.code}
                  className="flex items-start gap-2 rounded-lg bg-[#f8f9fb] px-3 py-2 text-sm"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
                  <div>
                    <span className="font-medium text-ckt-text">{step.title}</span>
                    <span className="text-ckt-text-secondary"> — {step.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            {hasOutput && (
              <a
                href={current.outputUrl ?? ''}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-ckt-primary py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                下载{isVideo ? '结果' : '图片'}
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`${hasOutput ? 'flex-1' : 'w-full'} rounded-xl border border-ckt-border py-2.5 text-sm text-ckt-text transition hover:bg-gray-50`}
            >
              继续创作
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
