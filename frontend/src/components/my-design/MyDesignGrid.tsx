import { useEffect, useRef, useState } from 'react'
import {
  Copy,
  FolderInput,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import type { MyDesignFolder, MyDesignItem, MyDesignPageMode } from '@/types/myDesign'
import { formatDesignTime } from '@/hooks/useMyDesign'
import { useDesignActions } from '@/hooks/useDesignActions'
import { coverFallback, cn } from '@/utils'

interface Props {
  mode: MyDesignPageMode
  items: MyDesignItem[]
  folders: MyDesignFolder[]
  viewMode: 'grid' | 'list'
  loading?: boolean
  onCreate?: () => void
  onRename: (id: number, title: string) => void
  onDelete: (id: number) => void
  onRestore?: (id: number) => void
  onPermanentDelete?: (id: number) => void
  onMove?: (id: number, folderId: number | null) => void
}

export function MyDesignGrid({
  mode,
  items,
  folders,
  viewMode,
  loading,
  onCreate,
  onRename,
  onDelete,
  onRestore,
  onPermanentDelete,
  onMove,
}: Props) {
  const { handleOpenDesign } = useDesignActions()

  if (loading && !items.length) {
    return (
      <div className={cn('my-design-grid', viewMode === 'list' && 'my-design-grid--list')}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="my-design-card my-design-card--skeleton" />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="my-design-empty">
        <div className="my-design-empty__icon" />
        <p className="my-design-empty__title">
          {mode === 'recycle'
            ? '回收站为空'
            : mode === 'favorite'
              ? '暂无收藏模板'
              : '还没有设计作品'}
        </p>
        <p className="my-design-empty__desc">
          {mode === 'recycle'
            ? '删除的设计会在这里保留 30 天'
            : mode === 'favorite'
              ? '在模板中心收藏喜欢的模板'
              : '创建你的第一个设计，开始高效创作之旅'}
        </p>
        {mode === 'list' && onCreate ? (
          <button type="button" className="my-design-empty__cta" onClick={onCreate}>
            立即创建
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn('my-design-grid', viewMode === 'list' && 'my-design-grid--list')}>
      {items.map((item) => (
        <DesignCard
          key={item.id}
          item={item}
          mode={mode}
          viewMode={viewMode}
          folders={folders}
          onOpen={() => handleOpenDesign(item)}
          onRename={onRename}
          onDelete={onDelete}
          onRestore={onRestore}
          onPermanentDelete={onPermanentDelete}
          onMove={onMove}
        />
      ))}
    </div>
  )
}

function DesignCard({
  item,
  mode,
  viewMode,
  folders,
  onOpen,
  onRename,
  onDelete,
  onRestore,
  onPermanentDelete,
  onMove,
}: {
  item: MyDesignItem
  mode: MyDesignPageMode
  viewMode: 'grid' | 'list'
  folders: MyDesignFolder[]
  onOpen: () => void
  onRename: (id: number, title: string) => void
  onDelete: (id: number) => void
  onRestore?: (id: number) => void
  onPermanentDelete?: (id: number) => void
  onMove?: (id: number, folderId: number | null) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const ratio =
    item.width && item.height ? `${item.width} / ${item.height}` : '3 / 4'

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setMoveOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  const handleRename = () => {
    const next = window.prompt('重命名设计', item.title)
    if (next && next.trim() && next.trim() !== item.title) {
      onRename(item.id, next.trim())
    }
    setMenuOpen(false)
  }

  return (
    <article
      className={cn('my-design-card', viewMode === 'list' && 'my-design-card--list')}
    >
      <button type="button" className="my-design-card__cover-wrap" onClick={onOpen}>
        <div className="my-design-card__cover" style={{ aspectRatio: ratio }}>
          <img
            src={item.coverUrl || coverFallback(`design-${item.id}`, 480, 640)}
            alt=""
            loading="lazy"
            className="my-design-card__img"
          />
          {item.typeLabel ? (
            <span className="my-design-card__badge">{item.typeLabel}</span>
          ) : null}
        </div>
      </button>

      <div className="my-design-card__meta">
        <button type="button" className="my-design-card__title" onClick={onOpen}>
          {item.title}
        </button>
        <div className="my-design-card__footer">
          <span className="my-design-card__time">
            {formatDesignTime(item.updateTime || item.createTime)}
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
                {mode === 'recycle' ? (
                  <>
                    <button type="button" onClick={() => { onRestore?.(item.id); setMenuOpen(false) }}>
                      <RotateCcw className="h-4 w-4" />
                      还原
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => {
                        if (window.confirm('确定永久删除？此操作不可恢复')) {
                          onPermanentDelete?.(item.id)
                        }
                        setMenuOpen(false)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      永久删除
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={handleRename}>
                      <Pencil className="h-4 w-4" />
                      重命名
                    </button>
                    <button type="button" onClick={onOpen}>
                      <Copy className="h-4 w-4" />
                      打开设计
                    </button>
                    {mode === 'list' && folders.length ? (
                      <div className="my-design-card__submenu">
                        <button
                          type="button"
                          onClick={() => setMoveOpen((v) => !v)}
                        >
                          <FolderInput className="h-4 w-4" />
                          移动到
                        </button>
                        {moveOpen ? (
                          <div className="my-design-card__submenu-list">
                            <button
                              type="button"
                              onClick={() => {
                                onMove?.(item.id, null)
                                setMenuOpen(false)
                              }}
                            >
                              全部设计
                            </button>
                            {folders.map((folder) => (
                              <button
                                key={folder.id}
                                type="button"
                                onClick={() => {
                                  onMove?.(item.id, folder.id)
                                  setMenuOpen(false)
                                }}
                              >
                                {folder.name}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      className="danger"
                      onClick={() => {
                        if (window.confirm('确定删除该设计？可在回收站恢复')) {
                          onDelete(item.id)
                        }
                        setMenuOpen(false)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      删除
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
