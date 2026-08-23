import { useCallback, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { helpFabApi } from '@/api'
import type { HelpFabMenuItem } from '@/types/helpFab'
import { cn } from '@/utils'

function HelpFabIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'book':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M2.5 3.2C2.5 2.54 3.04 2 3.7 2H6.2V13.4H3.7C3.04 13.4 2.5 12.86 2.5 12.2V3.2Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path
            d="M6.2 2H12.3C12.96 2 13.5 2.54 13.5 3.2V12.2C13.5 12.86 12.96 13.4 12.3 13.4H6.2V2Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M8.4 5.2H11.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M8.4 7.4H11.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'help-circle':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="5.8" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M6.2 6.05C6.35 5.2 7.05 4.55 8 4.55C8.95 4.55 9.75 5.25 9.75 6.25C9.75 7.45 8.15 7.65 8.15 9.05"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="8" cy="11.1" r="0.55" fill="currentColor" />
        </svg>
      )
    case 'feedback':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M3 3.8H13V10.2L10.2 10.2L8.6 12.2L7 10.2H3V3.8Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M5.6 6.4H10.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M5.6 8.2H8.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'headset':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M3.6 8.4V7.2C3.6 4.88 5.48 3 7.8 3H8.2C10.52 3 12.4 4.88 12.4 7.2V8.4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <rect x="2.8" y="8" width="2.2" height="3.6" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <rect x="11" y="8" width="2.2" height="3.6" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 11.6H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'file-plus':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M5.2 2.8H9.4L12.2 5.6V13.2H5.2V2.8Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M9.4 2.8V5.6H12.2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M8 8.2V11.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M6.4 9.8H9.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="5.8" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
  }
}

function HelpFabMenuRow({
  item,
  onAction,
}: {
  item: HelpFabMenuItem
  onAction: (item: HelpFabMenuItem) => void
}) {
  const inner = (
    <>
      <span className="help-fab__menu-icon">
        <HelpFabIcon icon={item.icon} />
      </span>
      <span className="help-fab__menu-label">{item.name}</span>
    </>
  )

  if (item.linkTarget === 'action') {
    return (
      <button type="button" className="help-fab__menu-item" onClick={() => onAction(item)}>
        {inner}
      </button>
    )
  }

  if (item.linkUrl?.startsWith('/')) {
    return (
      <Link to={item.linkUrl} className="help-fab__menu-item">
        {inner}
      </Link>
    )
  }

  return (
    <a
      href={item.linkUrl ?? '#'}
      className="help-fab__menu-item"
      target={item.linkTarget === '_self' ? '_self' : '_blank'}
      rel={item.linkTarget === '_self' ? undefined : 'noopener noreferrer'}
    >
      {inner}
    </a>
  )
}

function CustomerServicePanel({
  title,
  subtitle,
  qrCodeUrl,
  avatarUrl,
  onClose,
}: {
  title: string
  subtitle: string
  qrCodeUrl: string
  avatarUrl: string
  onClose: () => void
}) {
  return (
    <div className="help-fab__cs-panel">
      <button type="button" className="help-fab__cs-close" aria-label="关闭" onClick={onClose}>
        ×
      </button>
      <div className="help-fab__cs-header">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="help-fab__cs-avatar" />
        ) : null}
        <div>
          <p className="help-fab__cs-title">{title}</p>
          <p className="help-fab__cs-subtitle">{subtitle}</p>
        </div>
      </div>
      {qrCodeUrl ? <img src={qrCodeUrl} alt="客服二维码" className="help-fab__cs-qr" /> : null}
    </div>
  )
}

export function HelpFab() {
  const [open, setOpen] = useState(false)
  const [csOpen, setCsOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['helpFab'],
    queryFn: helpFabApi.getIndex,
    staleTime: 300_000,
    retry: 2,
  })

  const show = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpen(true)
  }, [])

  const hide = useCallback(() => {
    timerRef.current = setTimeout(() => setOpen(false), 200)
  }, [])

  const handleAction = (item: HelpFabMenuItem) => {
    if (item.code === 'customer-service') {
      setCsOpen(true)
      setOpen(false)
    }
  }

  const items = data?.items ?? []
  const cs = data?.customerService

  return (
    <>
      <div
        className="help-fab"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {(open || isLoading) && items.length > 0 ? (
          <div className="help-fab__menu" onMouseEnter={show} onMouseLeave={hide}>
            {items.map((item) => (
              <HelpFabMenuRow key={item.id} item={item} onAction={handleAction} />
            ))}
          </div>
        ) : null}

        <button
          type="button"
          className={cn('help-fab__trigger', open && 'help-fab__trigger--active')}
          aria-label="帮助与客服"
          aria-expanded={open}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <circle cx="9" cy="9" r="7.2" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M6.8 6.9C7 5.85 7.9 5.1 9 5.1C10.35 5.1 11.4 6.05 11.4 7.35C11.4 8.95 9.45 9.2 9.45 10.95"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <circle cx="9" cy="13.1" r="0.75" fill="currentColor" />
          </svg>
        </button>
      </div>

      {csOpen && cs ? (
        <div className="help-fab__cs-overlay" onClick={() => setCsOpen(false)}>
          <div className="help-fab__cs-dialog" onClick={(e) => e.stopPropagation()}>
            <CustomerServicePanel
              title={cs.title}
              subtitle={cs.subtitle}
              qrCodeUrl={cs.qrCodeUrl}
              avatarUrl={cs.avatarUrl}
              onClose={() => setCsOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
