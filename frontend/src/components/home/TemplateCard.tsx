import type { DesignTemplate } from '@/types'
import { coverFallback } from '@/utils'
import { Play } from 'lucide-react'

interface Props {
  template: DesignTemplate
  aspect?: 'portrait' | 'landscape' | 'square'
  badge?: 'HOT' | 'NEW' | 'FREE'
  showPlay?: boolean
  onClick?: () => void
}

export function TemplateCard({
  template,
  aspect = 'portrait',
  badge,
  showPlay,
  onClick,
}: Props) {
  const aspectClass =
    aspect === 'landscape'
      ? 'aspect-[16/9]'
      : aspect === 'square'
        ? 'aspect-square'
        : 'aspect-[3/4]'

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-lg bg-white transition hover:shadow-md"
    >
      <div className={`relative ${aspectClass} overflow-hidden bg-gray-100`}>
        <img
          src={template.coverUrl || coverFallback(template.id)}
          alt={template.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        {badge && (
          <span
            className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-medium text-white ${
              badge === 'HOT' ? 'bg-red-500' : badge === 'NEW' ? 'bg-green-500' : 'bg-ckt-primary'
            }`}
          >
            {badge === 'FREE' ? '限免' : badge}
          </span>
        )}
        {showPlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition group-hover:opacity-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow">
              <Play className="ml-0.5 h-4 w-4 fill-ckt-text text-ckt-text" />
            </div>
          </div>
        )}
      </div>
      <p className="mt-2 truncate px-0.5 text-xs text-ckt-text-secondary">{template.title}</p>
    </div>
  )
}
