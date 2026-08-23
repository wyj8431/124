import { Link, useLocation } from 'react-router-dom'
import {
  Folder,
  FolderOpen,
  Heart,
  LayoutGrid,
  Plus,
  Trash2,
} from 'lucide-react'
import type { MyDesignFolder, MyDesignNavItem, MyDesignStorage } from '@/types/myDesign'
import { cn } from '@/utils'

interface Props {
  navItems: MyDesignNavItem[]
  folders: MyDesignFolder[]
  activeFolderId: number | null | 'all'
  storage?: MyDesignStorage
  onCreateFolder: () => void
  onSelectFolder: (folderId: number | null | 'all') => void
}

const navIcons: Record<string, typeof LayoutGrid> = {
  list: LayoutGrid,
  favorite: Heart,
  recycle: Trash2,
}

export function MyDesignSidebar({
  navItems,
  folders,
  activeFolderId,
  storage,
  onCreateFolder,
  onSelectFolder,
}: Props) {
  const location = useLocation()

  return (
    <aside className="my-design-sidebar">
      <div className="my-design-sidebar__head">
        <h1 className="my-design-sidebar__title">我的空间</h1>
        {storage ? (
          <div className="my-design-sidebar__storage">
            <div className="my-design-sidebar__storage-bar">
              <span
                className="my-design-sidebar__storage-fill"
                style={{
                  width: `${Math.min(100, (storage.usedCount / storage.totalCount) * 100)}%`,
                }}
              />
            </div>
            <span className="my-design-sidebar__storage-text">{storage.label}</span>
          </div>
        ) : null}
      </div>

      <nav className="my-design-sidebar__nav">
        {navItems.map((item) => {
          const Icon = navIcons[item.code] ?? LayoutGrid
          const active = location.pathname === item.routePath
          return (
            <Link
              key={item.code}
              to={item.routePath}
              className={cn('my-design-sidebar__nav-item', active && 'my-design-sidebar__nav-item--active')}
              onClick={() => onSelectFolder('all')}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {location.pathname === '/dam-page/my/list' ? (
        <div className="my-design-sidebar__folders">
          <div className="my-design-sidebar__folders-head">
            <span>文件夹</span>
            <button
              type="button"
              className="my-design-sidebar__folders-add"
              onClick={onCreateFolder}
              aria-label="新建文件夹"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            className={cn(
              'my-design-sidebar__folder-item',
              activeFolderId === 'all' && 'my-design-sidebar__folder-item--active',
            )}
            onClick={() => onSelectFolder('all')}
          >
            <FolderOpen className="h-4 w-4 shrink-0" />
            <span>全部设计</span>
          </button>

          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              className={cn(
                'my-design-sidebar__folder-item',
                activeFolderId === folder.id && 'my-design-sidebar__folder-item--active',
              )}
              onClick={() => onSelectFolder(folder.id)}
            >
              <Folder className="h-4 w-4 shrink-0" />
              <span>{folder.name}</span>
            </button>
          ))}
        </div>
      ) : null}
    </aside>
  )
}
