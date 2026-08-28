import type {
  OfficialCatalog,
  OfficialCatalogSelection,
  OfficialScene,
  OfficialTemplate,
} from '../../modules/editor/officialCatalog.mjs'

type OfficialCatalogPanelProps = {
  catalog: OfficialCatalog
  selection: OfficialCatalogSelection
  mode: 'assets' | 'templates'
  selectedCategoryId: number | null
  onSelectCategory: (categoryId: number) => void
  onSelectScene: (scene: OfficialScene) => void
  onSelectTemplate: (template: OfficialTemplate) => void
}

const sceneLimit = 12
const templateLimit = 24

function SceneCard({ scene, onSelectScene }: Pick<OfficialCatalogPanelProps, 'onSelectScene'> & { scene: OfficialScene }) {
  return (
    <button className="design-editor-official-card design-editor-official-scene-card" type="button" onClick={() => onSelectScene(scene)}>
      <span className="design-editor-official-card-preview design-editor-official-scene-preview" aria-hidden="true">
        {scene.iconPath ? <img src={scene.iconPath} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} /> : scene.name.slice(0, 1)}
      </span>
      <span className="design-editor-official-card-title">{scene.name}</span>
      <span className="design-editor-official-card-meta">{scene.width} x {scene.height}{scene.unit ? ` ${scene.unit}` : ''}</span>
    </button>
  )
}

function TemplateCard({ template, onSelectTemplate }: Pick<OfficialCatalogPanelProps, 'onSelectTemplate'> & { template: OfficialTemplate }) {
  return (
    <button
      className="design-editor-official-card design-editor-official-template-card"
      type="button"
      disabled={!template.coverPath}
      onClick={() => { if (template.coverPath) onSelectTemplate(template) }}
    >
      <span className="design-editor-official-card-preview design-editor-official-template-preview" aria-hidden="true">
        {template.coverPath ? <img src={template.coverPath} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} /> : template.title.slice(0, 1)}
      </span>
      <span className="design-editor-official-card-title">{template.title}</span>
      {template.sceneName ? <span className="design-editor-official-card-meta">{template.sceneName}</span> : null}
    </button>
  )
}

export function OfficialCatalogPanel({
  catalog,
  selection,
  mode,
  selectedCategoryId,
  onSelectCategory,
  onSelectScene,
  onSelectTemplate,
}: OfficialCatalogPanelProps) {
  const visibleScenes = selection.scenes.slice(0, sceneLimit)
  const visibleTemplates = selection.templates.slice(0, templateLimit)
  const hasItems = (mode === 'assets' && visibleScenes.length > 0) || visibleTemplates.length > 0

  return (
    <section className="design-editor-official-catalog" aria-label="官网公开目录">
      <div className="design-editor-asset-section-heading"><strong>官网公开目录</strong></div>
      <div className="design-editor-official-categories" aria-label="官网公开目录分类">
        {catalog.categories.map((category) => (
          <button key={category.id} type="button" aria-pressed={category.id === selectedCategoryId} onClick={() => onSelectCategory(category.id)}>
            {category.name}
          </button>
        ))}
      </div>

      {hasItems ? (
        <div className="design-editor-official-grid">
          {mode === 'assets' ? visibleScenes.map((scene) => <SceneCard key={`scene-${scene.id}`} scene={scene} onSelectScene={onSelectScene} />) : null}
          {visibleTemplates.map((template) => <TemplateCard key={`template-${template.id}`} template={template} onSelectTemplate={onSelectTemplate} />)}
        </div>
      ) : <p className="design-editor-official-empty">当前分类没有匹配的公开素材</p>}
    </section>
  )
}
