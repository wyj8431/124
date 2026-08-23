import type { EditorPickItem } from '@/data/toolsPageData'

interface Props {
  title: string
  items: EditorPickItem[]
  onItemClick?: (title: string) => void
}

export function ToolEditorPick({ title, items, onItemClick }: Props) {
  return (
    <section className="tool-editor-pick">
      <h2 className="tool-editor-pick__title">{title}</h2>
      <div className="tool-editor-pick__list">
        {items.map((item) => (
          <button
            key={item.title}
            type="button"
            className="tool-editor-item"
            onClick={() => onItemClick?.(item.title)}
          >
            <div className="tool-editor-item__des">{item.title}</div>
            <div className="tool-editor-item__pic">
              <img src={item.cover} alt={item.title} loading="lazy" />
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
