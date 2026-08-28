import { ChevronRight, Sparkles, Type } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { OfficialResource } from '../../modules/editor/officialCatalog.mjs'

export type TextResourceGroup = {
  id: string
  title: string
  resources: OfficialResource[]
}

export type TextQuickPreset = {
  id: string
  label: string
  content: string
  fontSize: number
  fontWeight: number
  width?: number
  height?: number
  fontFamily?: string
}

export type LicensedFont = {
  id: string
  family: string
  displayName: string
  category: string
  sampleText?: string
}

type TextResourcePanelProps = {
  groups: TextResourceGroup[]
  onSelect: (resource: OfficialResource) => void
  onAddText: (preset: TextQuickPreset) => void
  onOpenAiWriter: () => void
  fonts: LicensedFont[]
}

const textQuickPresets: TextQuickPreset[] = [
  { id: 'headline', label: '标题', content: '标题文字', fontSize: 42, fontWeight: 700 },
  { id: 'subheading', label: '副标题', content: '副标题文字', fontSize: 28, fontWeight: 600 },
  { id: 'body', label: '正文', content: '正文内容', fontSize: 22, fontWeight: 400 },
  { id: 'vertical', label: '竖排文字', content: '竖\n排\n文\n字', fontSize: 34, fontWeight: 600, width: 72, height: 220 },
  { id: 'effect', label: '特效文字', content: '特效文字', fontSize: 46, fontWeight: 800 },
]

export function TextResourcePanel({ groups, onSelect, onAddText, onOpenAiWriter, fonts }: TextResourcePanelProps) {
  const [query, setQuery] = useState('')
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>([])

  const visibleGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return groups
      .map((group) => ({
        ...group,
        resources: group.resources.filter((resource) =>
          !normalizedQuery || `${resource.title} ${resource.sceneName} ${resource.categoryName}`.toLocaleLowerCase().includes(normalizedQuery),
        ),
      }))
      .filter((group) => group.resources.length > 0)
  }, [groups, query])

  const licensedFonts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return fonts.filter((font) => !normalizedQuery || `${font.displayName} ${font.category}`.toLocaleLowerCase().includes(normalizedQuery))
  }, [fonts, query])

  return (
    <section className="design-editor-text-resource-panel" aria-label="文字素材">
      <label className="design-editor-text-search">
        <Type className="h-4 w-4" aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文字" aria-label="搜索文字" />
      </label>
      <div className="design-editor-text-quick-grid" aria-label="快捷文字">
        {textQuickPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`design-editor-text-quick-card is-${preset.id}`}
            onClick={() => onAddText(preset)}
          >
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
      <button type="button" className="design-editor-text-ai-entry" onClick={onOpenAiWriter}>
        <span><Sparkles className="h-4 w-4" aria-hidden="true" />AI 文案</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
      {licensedFonts.length ? <section className="design-editor-text-resource-section" aria-label="已授权字体">
        <div className="design-editor-text-resource-heading"><strong>已授权字体</strong></div>
        <div className="design-editor-font-grid">
          {licensedFonts.map((font) => (
            <button
              key={font.id}
              type="button"
              className="design-editor-font-card"
              style={{ fontFamily: font.family }}
              onClick={() => onAddText({ id: `font-${font.id}`, label: font.displayName, content: font.sampleText ?? '示例文字', fontSize: 36, fontWeight: 400, fontFamily: font.family })}
            >
              <span>{font.displayName}</span><small>{font.category}</small>
            </button>
          ))}
        </div>
      </section> : null}
      {visibleGroups.length ? visibleGroups.map((group) => {
        const expanded = expandedGroupIds.includes(group.id)
        const resources = expanded ? group.resources : group.resources.slice(0, 3)
        return (
          <section key={group.id} className="design-editor-text-resource-section" aria-label={group.title}>
            <div className="design-editor-text-resource-heading">
              <strong>{group.title}</strong>
              {group.resources.length > 3 ? (
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`text-resource-group-${group.id}`}
                  onClick={() => setExpandedGroupIds((groupIds) => (
                    expanded ? groupIds.filter((id) => id !== group.id) : [...groupIds, group.id]
                  ))}
                >
                  {expanded ? '收起' : '全部'}
                </button>
              ) : null}
            </div>
            <div id={`text-resource-group-${group.id}`} className="design-editor-text-resource-grid">
              {resources.map((resource) => (
                <button key={resource.id} type="button" className="design-editor-text-resource-card" aria-label={`${group.title}：${resource.title}`} onClick={() => onSelect(resource)}>
                  <span className="design-editor-text-resource-preview" aria-hidden="true">
                    <img src={resource.previewPath} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} />
                  </span>
                </button>
              ))}
            </div>
          </section>
        )
      }) : <p className="design-editor-official-empty">当前没有匹配的文字素材</p>}
    </section>
  )
}
