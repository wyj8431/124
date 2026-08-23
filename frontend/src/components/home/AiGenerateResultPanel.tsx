import { X, Download, Sparkles, Film, ImageIcon } from 'lucide-react'
import type { AiGenerateResult } from '@/types'

interface Props {
  result: AiGenerateResult | null
  onClose: () => void
}

export function AiGenerateResultPanel({ result, onClose }: Props) {
  if (!result) return null

  const isVideo = result.outputType === 'video'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="animate-fade-in w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-ckt-border px-5 py-4">
          <div className="flex items-center gap-2">
            {isVideo ? (
              <Film className="h-5 w-5 text-teal-500" />
            ) : result.outputType === 'agent' ? (
              <Sparkles className="h-5 w-5 text-purple-500" />
            ) : (
              <ImageIcon className="h-5 w-5 text-orange-500" />
            )}
            <div>
              <h3 className="text-base font-semibold text-ckt-text">{result.message}</h3>
              {result.toolName && (
                <p className="text-xs text-ckt-text-secondary">工具：{result.toolName}</p>
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
          <div className="relative overflow-hidden rounded-xl bg-gray-50">
            <img
              src={result.outputUrl}
              alt="生成结果"
              className="w-full object-cover"
              style={{ maxHeight: 360 }}
            />
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <span className="ml-1 text-xl text-ckt-text">▶</span>
                </div>
                {result.duration && (
                  <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                    {result.duration}
                  </span>
                )}
              </div>
            )}
          </div>

          {result.steps && result.steps.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-ckt-text-secondary">Agent 执行步骤</p>
              {result.steps.map((step) => (
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
            <a
              href={result.outputUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-ckt-primary py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              <Download className="h-4 w-4" />
              下载{isVideo ? '封面' : '图片'}
            </a>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-ckt-border py-2.5 text-sm text-ckt-text transition hover:bg-gray-50"
            >
              继续创作
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
