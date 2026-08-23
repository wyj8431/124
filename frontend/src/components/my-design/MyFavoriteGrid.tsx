import { useEffect, useRef, useState } from 'react'
import { Heart, MoreHorizontal, Trash2 } from 'lucide-react'
import type { MyFavoriteItem } from '@/types/myDesign'
import { formatDesignTime } from '@/hooks/useMyDesign'
import { coverFallback } from '@/utils'

interface Props {
  items: MyFavoriteItem[]
  loading?: boolean
  onUnlike: (templateId: number) => void
}

export function MyFavoriteGrid({ items, loading, onUnlike }: Props) {
  if (loading && !items.length) {
    return (
      <div className="my-design-grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="my-design-card my-design-card--skeleton" />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="my-design-empty">
        <div className="my-design-empty__icon my-design-empty__icon--favorite" />
        <p className="my-design-empty__title">暂无收藏模板</p>
        <p className="my-design-empty__desc">在模板中心收藏喜欢的模板，方便下次快速使用</p>
      </div>
    )
  }

  return (
    <div className="my-design-grid">
      {items.map((item) => (
        <FavoriteCard key={item.id} item={item} onUnlike={onUnlike} />
      ))}
    </div>
  )
}

function FavoriteCard({
  item,
  onUnlike,
}: {
  item: MyFavoriteItem
  onUnlike: (templateId: number) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const ratio =
    item.width && item.height ? `${item.width} / ${item.height}` : '3 / 4'

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  return (
    <article className="my-design-card">
      <div className="my-design-card__cover-wrap">
        <div className="my-design-card__cover" style={{ aspectRatio: ratio }}>
          <img
            src={item.coverUrl || coverFallback(`tpl-${item.templateId}`, 480, 640)}
            alt=""
            loading="lazy"
            className="my-design-card__img"
          />
          {item.isFree === 1 ? (
            <span className="my-design-card__badge my-design-card__badge--free">免费</span>
          ) : null}
        </div>
      </div>

      <div className="my-design-card__meta">
        <p className="my-design-card__title my-design-card__title--static">{item.title}</p>
        <div className="my-design-card__footer">
          <span className="my-design-card__time">
            {formatDesignTime(item.likeTime)}
          </span>
          <div className="my-design-card__menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="my-design-card__menu-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="更多操作"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen ? (
              <div className="my-design-card__menu">
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    if (window.confirm('确定取消收藏？')) {
                      onUnlike(item.templateId)
                    }
                    setMenuOpen(false)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  取消收藏
                </button>
                <button type="button" onClick={() => setMenuOpen(false)}>
                  <Heart className="h-4 w-4" />
                  使用模板
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
