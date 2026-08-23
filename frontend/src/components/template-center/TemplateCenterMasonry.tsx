import type { DesignTemplate } from '@/types'
import { coverFallback } from '@/utils'

interface Props {
  templates: DesignTemplate[]
  loading?: boolean
  onTemplateClick?: (t: DesignTemplate) => void
}

function MasonryCard({ template, onClick }: { template: DesignTemplate; onClick?: () => void }) {
  const ratio =
    template.width && template.height
      ? `${template.width} / ${template.height}`
      : '3 / 4'

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-lg bg-white text-left transition hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
    >
      <div className="relative w-full overflow-hidden bg-[#f5f7fa]" style={{ aspectRatio: ratio }}>
        <img
          src={template.coverUrl || coverFallback(template.id)}
          alt={template.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
      <p className="mt-2 truncate px-1 text-xs text-[#646a73]">{template.title}</p>
    </button>
  )
}

function GallerySkeleton() {
  const heights = [320, 280, 360, 240, 300, 340, 260, 380, 290, 350, 270, 310]
  return (
    <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
      {heights.map((h, i) => (
        <div key={i} className="mb-4 break-inside-avoid">
          <div className="animate-pulse rounded-lg bg-[#eef0f3]" style={{ height: h }} />
        </div>
      ))}
    </div>
  )
}

/** 模板中心瀑布流 */
export function TemplateCenterMasonry({ templates, loading, onTemplateClick }: Props) {
  if (loading && !templates.length) return <GallerySkeleton />

  if (!templates.length) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#8f959e]">
        暂无符合条件的模板
      </div>
    )
  }

  return (
    <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
      {templates.map((t) => (
        <div key={t.id} className="mb-4 break-inside-avoid">
          <MasonryCard template={t} onClick={() => onTemplateClick?.(t)} />
        </div>
      ))}
    </div>
  )
}
