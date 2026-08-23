import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Plus, Settings2, Sparkles, WandSparkles } from 'lucide-react'
import { aiApi } from '@/api'
import type { AiTopicPreset } from '@/types/aiTopic'

const POSTER_PROMPT_PLACEHOLDER =
  '上传参考图片，描述下您需要的内容，我们会为您呈现~'

export function AiTopicPosterInput({
  activePreset,
  freePrompt,
  onFreePromptChange,
  onEnhancePrompt,
  onGenerate,
  generating,
}: {
  activePreset: AiTopicPreset | null
  freePrompt: string
  onFreePromptChange: (value: string) => void
  onEnhancePrompt: (value: string) => void
  onGenerate: (payload: { prompt: string; agentMode: boolean; autoMode: boolean }) => void
  generating: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const [autoMode, setAutoMode] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [referenceImageName, setReferenceImageName] = useState<string | null>(null)

  const composedPrompt = activePreset?.promptText?.trim() || freePrompt.trim()
  const canGenerate = composedPrompt.length > 0

  useEffect(() => {
    if (activePreset?.promptText) {
      onFreePromptChange('')
    }
  }, [activePreset?.id, activePreset?.promptText, onFreePromptChange])

  const handleEnhancePrompt = useCallback(async () => {
    if (!composedPrompt || enhancing) return
    setEnhancing(true)
    try {
      const result = await aiApi.enhancePrompt({ prompt: composedPrompt, mode: 'agent' })
      onEnhancePrompt(result.prompt)
    } catch {
      alert('润色失败，请稍后重试')
    } finally {
      setEnhancing(false)
    }
  }, [composedPrompt, enhancing, onEnhancePrompt])

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true)
    try {
      setReferenceImageName(file.name)
    } finally {
      setUploading(false)
    }
  }, [])

  return (
    <div
      className={`ai-topic-input-shell${focused ? ' ai-topic-input-shell--focused' : ''}${referenceImageName ? ' ai-topic-input-shell--has-ref' : ''}`}
    >
      <div className="ai-topic-input-shell__inner">
        {referenceImageName && (
          <div className="ai-topic-input-shell__ref-chip" title={referenceImageName}>
            参考图：{referenceImageName}
          </div>
        )}

        <textarea
          className="ai-topic-input-shell__textarea"
          value={activePreset ? activePreset.promptText : freePrompt}
          readOnly={Boolean(activePreset)}
          onChange={(event) => onFreePromptChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={POSTER_PROMPT_PLACEHOLDER}
          rows={2}
        />

        <div className="ai-topic-input-shell__footer">
          <div className="ai-topic-input-shell__toolbar">
            <button
              type="button"
              className="ai-topic-input-shell__icon-btn ai-topic-input-shell__icon-btn--round"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="上传参考图片"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>

            <button type="button" className="ai-topic-input-shell__tool-pill ai-topic-input-shell__tool-pill--active">
              <Sparkles className="h-3.5 w-3.5" />
              Agent模式
            </button>

            <button
              type="button"
              className={`ai-topic-input-shell__tool-pill${autoMode ? ' ai-topic-input-shell__tool-pill--active' : ''}`}
              onClick={() => setAutoMode((value) => !value)}
            >
              <Settings2 className="h-3.5 w-3.5" />
              自动
            </button>
          </div>

          <div className="ai-topic-input-shell__actions">
            <button
              type="button"
              className="ai-topic-input-shell__magic-btn"
              disabled={enhancing || !canGenerate}
              aria-label="魔法棒润色提示词"
              title="润色提示词"
              onClick={() => void handleEnhancePrompt()}
            >
              {enhancing ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#635ff2]" />
              ) : (
                <WandSparkles className="h-4 w-4 text-[#635ff2]" />
              )}
            </button>
            <button
              type="button"
              className="ai-topic-input-shell__submit"
              disabled={generating || !canGenerate}
              onClick={() =>
                onGenerate({
                  prompt: composedPrompt,
                  agentMode: true,
                  autoMode,
                })
              }
            >
              {generating ? '生成中...' : '生成'}
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleUpload(file)
          event.target.value = ''
        }}
      />
    </div>
  )
}
