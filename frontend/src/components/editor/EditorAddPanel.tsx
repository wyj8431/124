import {
  Bot,
  ChartNoAxesColumnIncreasing,
  Circle,
  CopyPlus,
  CornerDownRight,
  Expand,
  Import,
  Languages,
  Orbit,
  PenLine,
  Pill,
  QrCode,
  Smartphone,
  Sparkles,
  Square,
  Table2,
  Triangle,
  Type,
  Upload,
  WandSparkles,
  type LucideIcon,
} from 'lucide-react'
import {
  editorAddPanelSections,
  editorTextQuickPresets,
  type AddPanelAction,
  type EditorToolId,
  type ShapeKind,
  type TextQuickPreset,
} from '../../modules/editor/addPanelCatalog.mjs'

type EditorAddPanelProps = {
  onUpload: () => void
  onAddText: (preset: TextQuickPreset) => void
  onAddShape: (shape: ShapeKind) => void
  onOpenTool: (tool: EditorToolId) => void
  onOpenCanvasProperties: () => void
}

const iconByName: Record<string, LucideIcon> = {
  Upload,
  Smartphone,
  Type,
  Square,
  Triangle,
  Circle,
  Pill,
  CornerDownRight,
  Sparkles,
  ChartNoAxesColumnIncreasing,
  Orbit,
  Table2,
  QrCode,
  WandSparkles,
  Expand,
  Import,
  CopyPlus,
  Languages,
  PenLine,
  Bot,
}

export function EditorAddPanel({ onUpload, onAddText, onAddShape, onOpenTool, onOpenCanvasProperties }: EditorAddPanelProps) {
  const runAction = (action: AddPanelAction) => {
    if (action.type === 'upload') {
      onUpload()
      return
    }

    if (action.type === 'text') {
      const preset = editorTextQuickPresets.find((candidate) => candidate.id === action.presetId)
      if (preset) onAddText(preset)
      return
    }

    if (action.type === 'shape') {
      const shape = action.shape
      onAddShape(shape)
      return
    }

    if (action.type === 'canvas') {
      onOpenCanvasProperties()
      return
    }

    onOpenTool(action.tool)
  }

  return (
    <section className="design-editor-add-panel" aria-label="添加资源">
      {editorAddPanelSections.map((section) => (
        <section key={section.id} className={`design-editor-add-section is-${section.id}`} aria-labelledby={`editor-add-${section.id}`}>
          <div className="design-editor-add-section-heading">
            <strong id={`editor-add-${section.id}`}>{section.title}</strong>
            <button type="button" onClick={() => runAction(section.moreAction)} aria-label={`查看更多${section.title}`}>更多</button>
          </div>
          <div className={section.id === 'shapes' ? 'design-editor-add-shape-grid' : 'design-editor-add-card-grid'}>
            {section.cards.map((card) => {
              const Icon = iconByName[card.icon] || Square
              return (
                <button
                  key={card.id}
                  type="button"
                  className={section.id === 'shapes' ? 'design-editor-add-shape-card' : 'design-editor-add-card'}
                  onClick={() => runAction(card.action)}
                  aria-label={card.label}
                  title={card.label}
                >
                  {section.id === 'text' ? <span className={`design-editor-add-text-label is-${card.id}`}>{card.label}</span> : <><Icon aria-hidden="true" />{section.id === 'shapes' ? null : <span>{card.label}</span>}</>}
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </section>
  )
}
