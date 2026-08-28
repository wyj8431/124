import { ImagePlus, Plus, Search, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { OfficialResource } from '../../modules/editor/officialCatalog.mjs'

export type ImageResourceGroup = {
  id: string
  title: string
  tag: string
  resources: OfficialResource[]
}

type ImageResourcePanelProps = {
  groups: ImageResourceGroup[]
  imageUrl: string
  onImageUrlChange: (value: string) => void
  onUpload: () => void
  onAddUrl: () => void
  onSelect: (resource: OfficialResource) => void
}

const imageTags = ['春天', '科技', '教育', '美食', '背景', '旅行']

export function ImageResourcePanel({ groups, imageUrl, onImageUrlChange, onUpload, onAddUrl, onSelect }: ImageResourcePanelProps) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>([])

  const visibleGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return groups
      .filter((group) => !activeTag || group.tag === activeTag)
      .map((group) => ({
        ...group,
        resources: group.resources.filter((resource) =>
          !normalizedQuery || `${resource.title} ${resource.sceneName} ${resource.categoryName}`.toLocaleLowerCase().includes(normalizedQuery),
        ),
      }))
      .filter((group) => group.resources.length > 0)
  }, [activeTag, groups, query])

  return (
    <section className="design-editor-image-resource-panel" aria-label="图片素材">
      <button type="button" className="design-editor-image-upload" onClick={onUpload}><Upload className="h-4 w-4" />上传图片</button>
      <form className="design-editor-image-resource-url" onSubmit={(event) => { event.preventDefault(); onAddUrl() }}>
        <ImagePlus className="h-4 w-4" aria-hidden="true" />
        <input value={imageUrl} placeholder="粘贴图片地址" aria-label="粘贴图片地址" onChange={(event) => onImageUrlChange(event.target.value)} />
        <button type="submit" aria-label="添加图片地址"><Plus className="h-4 w-4" /></button>
      </form>
      <label className="design-editor-image-resource-search">
        <Search className="h-4 w-4" aria-hidden="true" />
        <input value={query} placeholder="搜索图片" aria-label="搜索图片" onChange={(event) => setQuery(event.target.value)} />
      </label>
      <div className="design-editor-image-resource-tags" aria-label="图片分类">
        {imageTags.map((tag) => (
          <button key={tag} type="button" aria-pressed={activeTag === tag} onClick={() => setActiveTag((currentTag) => currentTag === tag ? null : tag)}>{tag}</button>
        ))}
      </div>
      {visibleGroups.length ? visibleGroups.map((group) => {
        const expanded = expandedGroupIds.includes(group.id)
        const resources = expanded ? group.resources : group.resources.slice(0, 3)
        const resourceClassName = expanded ? 'design-editor-image-resource-grid' : 'design-editor-image-resource-track'
        return (
          <section key={group.id} className="design-editor-image-resource-section" aria-label={group.title}>
            <div className="design-editor-image-resource-heading">
              <strong>{group.title}</strong>
              {group.resources.length > 3 ? (
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`image-resource-group-${group.id}`}
                  onClick={() => setExpandedGroupIds((groupIds) => (
                    expanded ? groupIds.filter((id) => id !== group.id) : [...groupIds, group.id]
                  ))}
                >
                  {expanded ? '收起' : '全部'}
                </button>
              ) : null}
            </div>
            <div id={`image-resource-group-${group.id}`} className={resourceClassName}>
              {resources.map((resource) => (
                <button key={`${resource.kind}-${resource.sceneId}-${resource.id}`} type="button" className="design-editor-image-resource-card" aria-label={`${group.title}：${resource.title}`} onClick={() => onSelect(resource)}>
                  <img src={resource.previewPath} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} />
                </button>
              ))}
            </div>
          </section>
        )
      }) : <p className="design-editor-official-empty">当前没有匹配的图片素材</p>}
    </section>
  )
}
