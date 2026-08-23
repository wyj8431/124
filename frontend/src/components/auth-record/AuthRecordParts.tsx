import { Calendar, Search } from 'lucide-react'
import type { AuthRecordItem } from '@/types/authRecord'
import { coverFallback, cn } from '@/utils'

interface Props {
  items: AuthRecordItem[]
  batchMode: boolean
  selectedIds: number[]
  onToggle: (id: number) => void
  onDownload: (id: number) => void
}

export function AuthRecordGrid({ items, batchMode, selectedIds, onToggle, onDownload }: Props) {
  return (
    <div className="auth-record-grid">
      {items.map((item) => {
        const checked = selectedIds.includes(item.id)
        return (
          <article key={item.id} className={cn('auth-record-card', checked && 'is-selected')}>
            {batchMode ? (
              <label className="auth-record-card__check">
                <input type="checkbox" checked={checked} onChange={() => onToggle(item.id)} />
              </label>
            ) : null}
            <div className="auth-record-card__cover">
              <img
                src={item.coverUrl || coverFallback(`auth-${item.designId}`, 480, 360)}
                alt=""
              />
            </div>
            <div className="auth-record-card__body">
              <h3>{item.designTitle}</h3>
              <p>{item.authTypeLabel}</p>
              <p className="auth-record-card__time">{item.authTime}</p>
              <div className="auth-record-card__actions">
                <button type="button" className="order-btn" onClick={() => onDownload(item.id)}>
                  下载授权书
                </button>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

interface ToolbarProps {
  count: number
  keyword: string
  startDate: string
  endDate: string
  searchPlaceholder: string
  onKeywordChange: (value: string) => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onSearch: () => void
}

export function AuthRecordToolbar({
  count,
  keyword,
  startDate,
  endDate,
  searchPlaceholder,
  onKeywordChange,
  onStartDateChange,
  onEndDateChange,
  onSearch,
}: ToolbarProps) {
  return (
    <div className="auth-record-toolbar">
      <p className="auth-record-toolbar__count">已授权{count}个设计作品</p>
      <div className="auth-record-toolbar__filters">
        <div className="auth-record-date-range">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            aria-label="开始日期"
          />
          <span>~</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            aria-label="结束日期"
          />
          <Calendar className="auth-record-date-range__icon" />
        </div>
        <div className="auth-record-search">
          <input
            type="text"
            value={keyword}
            placeholder={searchPlaceholder}
            onChange={(e) => onKeywordChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch()
            }}
          />
          <button type="button" aria-label="搜索" onClick={onSearch}>
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface BatchBarProps {
  selectedCount: number
  batchDownloadText: string
  batchDownloadTip: string
  downloading?: boolean
  onBatchDownload: () => void
  onCancel: () => void
}

export function AuthRecordBatchBar({
  selectedCount,
  batchDownloadText,
  batchDownloadTip,
  downloading,
  onBatchDownload,
  onCancel,
}: BatchBarProps) {
  return (
    <div className="auth-record-batch-bar">
      <label className="auth-record-batch-bar__select">
        <input type="checkbox" checked={selectedCount > 0} readOnly />
        <span>已选中{selectedCount}个作品</span>
      </label>
      <span className="auth-record-batch-bar__divider" />
      <button
        type="button"
        className="auth-record-batch-bar__primary"
        disabled={selectedCount === 0 || downloading}
        onClick={onBatchDownload}
      >
        <span>{batchDownloadText}</span>
        <span>({batchDownloadTip})</span>
      </button>
      <button type="button" className="auth-record-batch-bar__cancel" onClick={onCancel}>
        取消批量操作
      </button>
    </div>
  )
}

export function AuthRecordEmpty({ text }: { text: string }) {
  return <p className="auth-record-empty">{text}</p>
}

export function AuthRecordFooter() {
  return (
    <footer className="auth-record-footer">
      <span>Copyright©创一创科技有限公司</span>
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">
        京ICP备14056892号-1
      </a>
    </footer>
  )
}
