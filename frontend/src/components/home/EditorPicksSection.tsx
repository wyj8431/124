import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from '@/components/layout/LayoutParts'
import { collectionApi } from '@/api'
import type { EditorCollection } from '@/types'
import { coverFallback, featureCover } from '@/utils'

interface Props {
  onSelect?: (collection: EditorCollection) => void
}

function PreviewImage({
  src,
  alt,
  className,
  index,
}: {
  src: string
  alt: string
  className: string
  index: number
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`${className} editor-picks-preview__fallback`}
        style={{ background: featureCover(alt, index) }}
        aria-label={alt}
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

function PreviewStack({
  urls,
  title,
  id,
}: {
  urls: string[]
  title: string
  id: number
}) {
  const normalized = urls.filter(Boolean)
  const front = normalized[0] ?? coverFallback(`col-front-${id}`, 116, 156)
  const back = normalized[1] ?? normalized[0] ?? coverFallback(`col-back-${id}`, 116, 156)

  return (
    <div className="editor-picks-preview">
      <div className="editor-picks-preview__stack">
        <PreviewImage
          src={back}
          alt={`${title} 预览2`}
          className="editor-picks-preview__back"
          index={id}
        />
        <PreviewImage
          src={front}
          alt={`${title} 预览1`}
          className="editor-picks-preview__front"
          index={id + 1}
        />
      </div>
    </div>
  )
}

export function EditorPicksSection({ onSelect }: Props) {
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['editorCollections'],
    queryFn: collectionApi.list,
    staleTime: 60_000,
  })

  if (isLoading && !collections.length) {
    return (
      <section className="editor-picks mb-10">
        <h2 className="mb-4 text-lg font-semibold text-ckt-text">编辑精选</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[168px] animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      </section>
    )
  }

  if (!collections.length) return null

  return (
    <section className="editor-picks mb-10">
      <h2 className="mb-4 text-lg font-semibold text-ckt-text">编辑精选</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {collections.slice(0, 6).map((item) => {
          const previews =
            item.previewUrls?.length
              ? item.previewUrls
              : [item.coverUrl, item.coverUrlHover].filter((u): u is string => !!u)

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect?.(item)}
              className="editor-picks-card group text-left"
            >
              <div className="editor-picks-card__cover">
                <PreviewStack urls={previews} title={item.title} id={item.id} />
              </div>

              <div className="editor-picks-card__footer">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ckt-text">{item.title}</p>
                  <p className="mt-0.5 truncate text-[11px] leading-snug text-ckt-text-secondary">
                    {item.subtitle}
                  </p>
                </div>
                <span className="editor-picks-card__arrow" aria-hidden>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
