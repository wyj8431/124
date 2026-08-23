import type { EditorCollection } from '@/types'
import { featureCover } from '@/utils'

interface Props {
  collections: EditorCollection[]
}

export function EditorCollections({ collections }: Props) {
  return (
    <section className="mb-10 px-6">
      <h2 className="mb-4 text-lg font-semibold text-ckt-text">编辑精选</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {collections.map((col, i) => (
          <div
            key={col.id}
            className="group relative cursor-pointer overflow-hidden rounded-2xl transition hover:shadow-lg"
            style={{ background: featureCover(col.title, i + 2) }}
          >
            <div className="aspect-[4/5] p-4">
              <div className="text-sm font-semibold text-white drop-shadow">{col.title}</div>
              <div className="mt-1 text-[11px] text-white/85">{col.subtitle}</div>
            </div>
            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
          </div>
        ))}
      </div>
    </section>
  )
}
