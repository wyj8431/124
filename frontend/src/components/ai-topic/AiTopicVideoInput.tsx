import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'

import { useQuery } from '@tanstack/react-query'

import {

  Check,

  ChevronDown,

  Film,

  ImageIcon,

  Loader2,

  Plus,

  Settings2,

  Sparkles,

  WandSparkles,

} from 'lucide-react'

import { aiApi } from '@/api'

import type { AiTopicPreset } from '@/types/aiTopic'

import {

  buildTemplatePrompt,

  findTemplateByPresetTitle,

  VIDEO_STYLE_OPTIONS,

  type AiVideoTopicTemplate,

} from '@/data/aiVideoTopicTemplates'



const TOPIC_PROMPT_PLACEHOLDER =

  '上传参考图片，描述下您想要的内容，我们会为您呈现~'



type GenerationMode = 'agent' | 'image' | 'video'



const GENERATION_MODES: {

  id: GenerationMode

  label: string

  subtitle: string

  icon: ComponentType<{ className?: string }>

  configMode: string

}[] = [

  {

    id: 'agent',

    label: 'Agent模式',

    subtitle: '训练立体高效创作',

    icon: Sparkles,

    configMode: 'agent',

  },

  {

    id: 'image',

    label: '生图片',

    subtitle: '高清精美图片',

    icon: ImageIcon,

    configMode: 'image_gen',

  },

  {

    id: 'video',

    label: '生视频',

    subtitle: '流畅生动视频',

    icon: Film,

    configMode: 'video_gen',

  },

]



function CapsuleSelect({

  value,

  options,

  onChange,

  openKey,

  capsuleKey,

  onOpenChange,

}: {

  value: string

  options: string[]

  onChange: (value: string) => void

  openKey: string | null

  capsuleKey: string

  onOpenChange: (key: string | null) => void

}) {

  const open = openKey === capsuleKey



  return (

    <span className="ai-topic-input-capsule-wrap">

      <button

        type="button"

        className="ai-topic-input-capsule ai-topic-input-capsule--select"

        onClick={(e) => {

          e.stopPropagation()

          onOpenChange(open ? null : capsuleKey)

        }}

      >

        <span>{value}</span>

        <ChevronDown className="h-3.5 w-3.5 opacity-70" />

      </button>

      {open && (

        <ul className="ai-topic-input-capsule-menu" role="listbox">

          {options.map((option) => (

            <li key={option}>

              <button

                type="button"

                className={`ai-topic-input-capsule-menu__item${option === value ? ' ai-topic-input-capsule-menu__item--active' : ''}`}

                onClick={(e) => {

                  e.stopPropagation()

                  onChange(option)

                  onOpenChange(null)

                }}

              >

                {option}

              </button>

            </li>

          ))}

        </ul>

      )}

    </span>

  )

}



function FooterModule({

  label,

  value,

  options,

  openKey,

  moduleKey,

  onOpenChange,

  onChange,

}: {

  label: string

  value: string

  options: string[]

  openKey: string | null

  moduleKey: string

  onOpenChange: (key: string | null) => void

  onChange: (value: string) => void

}) {

  const open = openKey === moduleKey



  return (

    <div className="ai-topic-input-module">

      <button

        type="button"

        className="ai-topic-input-module__btn"

        onClick={(e) => {

          e.stopPropagation()

          onOpenChange(open ? null : moduleKey)

        }}

      >

        <span className="ai-topic-input-module__label">{label}</span>

        <ChevronDown className="h-3.5 w-3.5 opacity-60" />

      </button>

      {open && (

        <ul className="ai-topic-input-module-menu" role="listbox">

          {options.map((option) => (

            <li key={option}>

              <button

                type="button"

                className={`ai-topic-input-module-menu__item${option === value ? ' ai-topic-input-module-menu__item--active' : ''}`}

                onClick={(e) => {

                  e.stopPropagation()

                  onChange(option)

                  onOpenChange(null)

                }}

              >

                {option}

              </button>

            </li>

          ))}

        </ul>

      )}

    </div>

  )

}



function GenerationModeMenu({

  mode,

  open,

  onOpenChange,

  onChange,

}: {

  mode: GenerationMode

  open: boolean

  onOpenChange: (open: boolean) => void

  onChange: (mode: GenerationMode) => void

}) {

  const current = GENERATION_MODES.find((item) => item.id === mode) ?? GENERATION_MODES[0]

  const CurrentIcon = current.icon



  return (

    <div className="ai-topic-input-mode-wrap">

      <button

        type="button"

        className={`ai-topic-input-shell__tool-pill ai-topic-input-shell__tool-pill--active`}

        onClick={(e) => {

          e.stopPropagation()

          onOpenChange(!open)

        }}

      >

        <CurrentIcon className="h-3.5 w-3.5" />

        {current.label}

        <ChevronDown className={`h-3.5 w-3.5 opacity-70 transition-transform${open ? ' rotate-180' : ''}`} />

      </button>

      {open && (

        <div className="ai-topic-input-mode-menu" role="menu">

          <p className="ai-topic-input-mode-menu__title">生成方式</p>

          {GENERATION_MODES.map((item) => {

            const Icon = item.icon

            const selected = item.id === mode

            return (

              <button

                key={item.id}

                type="button"

                role="menuitem"

                className={`ai-topic-input-mode-menu__item${selected ? ' ai-topic-input-mode-menu__item--active' : ''}`}

                onClick={(e) => {

                  e.stopPropagation()

                  onChange(item.id)

                  onOpenChange(false)

                }}

              >

                <span className="ai-topic-input-mode-menu__icon" aria-hidden>

                  <Icon className="h-4 w-4" />

                </span>

                <span className="ai-topic-input-mode-menu__body">

                  <span className="ai-topic-input-mode-menu__label">{item.label}</span>

                  <span className="ai-topic-input-mode-menu__desc">{item.subtitle}</span>

                </span>

                {selected && <Check className="ai-topic-input-mode-menu__check h-4 w-4" />}

              </button>

            )

          })}

        </div>

      )}

    </div>

  )

}



export function AiTopicVideoInput({

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

  onEnhancePrompt?: (value: string) => void

  onGenerate: (payload: {

    prompt: string

    aspectRatio?: string

    style?: string

    agentMode?: boolean

    autoMode?: boolean

    generationMode?: GenerationMode

  }) => void

  generating: boolean

}) {

  const fileRef = useRef<HTMLInputElement>(null)

  const uploadKeyRef = useRef<string>('asset')

  const [focused, setFocused] = useState(false)

  const [uploading, setUploading] = useState(false)

  const [enhancing, setEnhancing] = useState(false)

  const [generationMode, setGenerationMode] = useState<GenerationMode>('agent')

  const [autoMode, setAutoMode] = useState(false)

  const [referenceUrls, setReferenceUrls] = useState<string[]>([])

  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null)

  const [modeMenuOpen, setModeMenuOpen] = useState(false)

  const [templateValues, setTemplateValues] = useState<Record<string, string>>({})

  const [aspectRatio, setAspectRatio] = useState('9:16')

  const [style, setStyle] = useState<string>(VIDEO_STYLE_OPTIONS[0])



  const template = useMemo(

    () => (activePreset ? findTemplateByPresetTitle(activePreset.title) : null),

    [activePreset],

  )



  const configMode =

    GENERATION_MODES.find((item) => item.id === generationMode)?.configMode ?? 'video_gen'



  const { data: aiConfig } = useQuery({

    queryKey: ['aiConfig', configMode],

    queryFn: () => aiApi.getConfig(configMode),

    staleTime: 300_000,

  })



  useEffect(() => {

    if (!template) return

    setTemplateValues({ ...template.defaults })

    setAspectRatio(template.defaults.ratio ?? '9:16')

    setOpenMenuKey(null)

    setModeMenuOpen(false)

  }, [template])



  useEffect(() => {

    if (!openMenuKey && !modeMenuOpen) return

    const close = () => {

      setOpenMenuKey(null)

      setModeMenuOpen(false)

    }

    window.addEventListener('click', close)

    return () => window.removeEventListener('click', close)

  }, [openMenuKey, modeMenuOpen])



  const ratioOptions =

    aiConfig?.aspectRatios.map((item) => item.name) ?? ['9:16', '16:9', '1:1']



  const composedPrompt = template

    ? buildTemplatePrompt(template, {

        ...templateValues,

        ratio: aspectRatio,

      })

    : freePrompt.trim()



  const canGenerate = composedPrompt.length > 0



  const handleUpload = async (files: FileList | null) => {

    if (!files?.length) return

    setUploading(true)

    try {

      const urls: string[] = []

      for (const file of Array.from(files).slice(0, 3)) {

        const res = await aiApi.upload(file)

        urls.push(res.url)

      }

      setReferenceUrls((prev) => [...prev, ...urls].slice(0, 3))

      if (template) {

        const label = referenceUrls.length > 0 ? '已上传图片' : templateValues.asset

        setTemplateValues((prev) => ({ ...prev, asset: label || '已上传图片' }))

      }

    } catch {

      alert('上传失败，请确认后端已启动')

    } finally {

      setUploading(false)

      if (fileRef.current) fileRef.current.value = ''

    }

  }



  const triggerUpload = (key: string) => {

    uploadKeyRef.current = key

    fileRef.current?.click()

  }



  const updateTemplateValue = (key: string, value: string) => {

    setTemplateValues((prev) => ({ ...prev, [key]: value }))

    if (key === 'ratio') setAspectRatio(value)

  }



  const handleEnhancePrompt = async () => {

    if (!composedPrompt || enhancing) return

    setEnhancing(true)

    try {

      const result = await aiApi.enhancePrompt({

        prompt: composedPrompt,

        mode: configMode,

      })

      if (onEnhancePrompt) {

        onEnhancePrompt(result.prompt)

      } else {

        onFreePromptChange(result.prompt)

      }

    } catch {

      alert('润色失败，请稍后重试')

    } finally {

      setEnhancing(false)

    }

  }



  const renderTemplate = (tpl: AiVideoTopicTemplate) => (

    <div className="ai-topic-input-template" onClick={(e) => e.stopPropagation()}>

      {tpl.segments.map((segment, index) => {

        if (segment.type === 'text') {

          return (

            <span key={`text-${index}`} className="ai-topic-input-template__text">

              {segment.value}

            </span>

          )

        }



        if (segment.type === 'upload') {

          return (

            <span key={segment.key} className="ai-topic-input-capsule-wrap">

              <button

                type="button"

                className="ai-topic-input-capsule ai-topic-input-capsule--upload"

                onClick={(e) => {

                  e.stopPropagation()

                  triggerUpload(segment.key)

                }}

              >

                {referenceUrls.length > 0 ? '已上传图片' : templateValues[segment.key] ?? segment.label}

              </button>

            </span>

          )

        }



        return (

          <CapsuleSelect

            key={segment.key}

            capsuleKey={segment.key}

            value={segment.key === 'ratio' ? aspectRatio : templateValues[segment.key] ?? segment.defaultValue}

            options={segment.options}

            openKey={openMenuKey}

            onOpenChange={setOpenMenuKey}

            onChange={(value) => updateTemplateValue(segment.key, value)}

          />

        )

      })}

    </div>

  )



  return (

    <div

      className={`ai-topic-input-shell__bar${focused ? ' ai-topic-input-shell__bar--focused' : ''}`}

      onClick={() => {

        setOpenMenuKey(null)

        setModeMenuOpen(false)

      }}

    >

      <input

        ref={fileRef}

        type="file"

        accept="image/*"

        multiple

        className="hidden"

        onChange={(e) => handleUpload(e.target.files)}

      />

      <div className="ai-topic-input-shell__card">

        {referenceUrls.length > 0 && (

          <div className="ai-topic-input-shell__refs">

            {referenceUrls.map((url) => (

              <img key={url} src={url} alt="" className="ai-topic-input-shell__ref-thumb" />

            ))}

          </div>

        )}



        {template ? (

          renderTemplate(template)

        ) : (

          <textarea

            className="ai-topic-input-shell__textarea"

            value={freePrompt}

            onChange={(e) => onFreePromptChange(e.target.value)}

            onFocus={() => setFocused(true)}

            onBlur={() => setFocused(false)}

            placeholder={TOPIC_PROMPT_PLACEHOLDER}

            rows={2}

          />

        )}



        <div className="ai-topic-input-shell__footer">

          <div className="ai-topic-input-shell__toolbar">

            {!template && (

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

            )}

            <GenerationModeMenu

              mode={generationMode}

              open={modeMenuOpen}

              onOpenChange={setModeMenuOpen}

              onChange={setGenerationMode}

            />

            {generationMode === 'agent' && (

              <button

                type="button"

                className={`ai-topic-input-shell__tool-pill${autoMode ? ' ai-topic-input-shell__tool-pill--active' : ''}`}

                onClick={() => setAutoMode((value) => !value)}

              >

                <Settings2 className="h-3.5 w-3.5" />

                自动

              </button>

            )}

            <FooterModule

              label="尺寸"

              value={aspectRatio}

              options={ratioOptions}

              openKey={openMenuKey}

              moduleKey="footer-ratio"

              onOpenChange={setOpenMenuKey}

              onChange={(value) => {

                setAspectRatio(value)

                if (template) updateTemplateValue('ratio', value)

              }}

            />

            {generationMode !== 'image' && (

              <FooterModule

                label="风格"

                value={style}

                options={[...VIDEO_STYLE_OPTIONS]}

                openKey={openMenuKey}

                moduleKey="footer-style"

                onOpenChange={setOpenMenuKey}

                onChange={setStyle}

              />

            )}

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

                  aspectRatio,

                  style,

                  agentMode: generationMode === 'agent',

                  autoMode,

                  generationMode,

                })

              }

            >

              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : '生成'}

            </button>

          </div>

        </div>

      </div>

    </div>

  )

}


