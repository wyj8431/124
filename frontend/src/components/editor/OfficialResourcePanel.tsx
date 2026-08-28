import type { OfficialResource } from '../../modules/editor/officialCatalog.mjs'

type OfficialResourcePanelProps = {
  heading: string
  label: string
  resources: OfficialResource[]
  onSelect: (resource: OfficialResource) => void
}

export function OfficialResourcePanel({ heading, label, resources, onSelect }: OfficialResourcePanelProps) {
  return (
    <section className="design-editor-official-resource" aria-label={label}>
      <div className="design-editor-asset-section-heading"><strong>{heading}</strong></div>
      {resources.length ? (
        <div className="design-editor-official-resource-grid">
          {resources.slice(0, 24).map((resource) => (
            <button
              key={`${resource.kind}-${resource.sceneId}-${resource.id}`}
              type="button"
              className="design-editor-official-resource-card"
              aria-label={`${label}：${resource.title}`}
              onClick={() => onSelect(resource)}
            >
              <span className="design-editor-official-resource-preview" aria-hidden="true">
                <img src={resource.previewPath} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} />
              </span>
              <span>{resource.title}</span>
              <small>{resource.sceneName}</small>
            </button>
          ))}
        </div>
      ) : <p className="design-editor-official-empty">当前没有可用的公开资源</p>}
    </section>
  )
}
