import type { ToolSection } from '@/data/toolsPageData'
import { MarketingToolCard } from '@/components/tools/MarketingToolCard'

interface Props {
  section: ToolSection
  onItemClick?: (title: string) => void
}

export function MarketingToolSection({ section, onItemClick }: Props) {
  return (
    <section className="marketing-tool-cards">
      <h2 className="marketing-tool-cards__title">{section.title}</h2>
      <div className="marketing-tool-cards__list">
        {section.items.map((item) => (
          <MarketingToolCard
            key={item.title}
            item={item}
            onClick={() => onItemClick?.(item.title)}
          />
        ))}
      </div>
    </section>
  )
}
