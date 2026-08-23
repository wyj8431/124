import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { ToolCardItem } from '@/data/toolsPageData'
import { TOOL_CARD_SCALE } from '@/data/toolsPageData'

const FRAME_WIDTH = 231

interface Props {
  item: ToolCardItem
  onClick?: () => void
}

export function MarketingToolCard({ item, onClick }: Props) {
  const itemRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(TOOL_CARD_SCALE)
  const hoverCover = item.coverHover ?? item.cover

  useEffect(() => {
    const el = itemRef.current
    if (!el) return

    const updateScale = () => {
      const width = el.getBoundingClientRect().width
      if (width > 0) setScale(width / FRAME_WIDTH)
    }

    updateScale()
    const ro = new ResizeObserver(updateScale)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={itemRef}
      className="marketing-tool-cards__item"
      style={
        {
          '--card-scale': scale,
          '--frame-width': `${FRAME_WIDTH}px`,
          '--frame-height': '66px',
          '--frame-height-hover': '94px',
        } as CSSProperties
      }
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      role="button"
      tabIndex={0}
    >
      <div className="marketing-tool-cards__frame">
        <div className="marketing-tool-cards__content">
          <div className="marketing-tool-cards__text">
            <div className="marketing-tool-cards__text-default">
              <div className="marketing-tool-cards__item-title">
                <span title={item.title}>{item.title}</span>
              </div>
              <div className="marketing-tool-cards__item-desc">{item.desc}</div>
            </div>
            <div className="marketing-tool-cards__text-hover">
              <div className="marketing-tool-cards__item-title marketing-tool-cards__item-title--hover">
                <span title={item.title}>{item.title}</span>
              </div>
              <div className="marketing-tool-cards__cta">
                <span>立即体验</span>
                <svg
                  className="marketing-tool-cards__cta-icon"
                  viewBox="0 0 8 8"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1.5 4H6.5M6.5 4L4.5 2M6.5 4L4.5 6"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="marketing-tool-cards__cover">
            <img
              src={item.cover}
              alt={item.title}
              loading="lazy"
              className="marketing-tool-cards__cover-default"
            />
            <img
              src={hoverCover}
              alt={item.title}
              loading="lazy"
              className="marketing-tool-cards__cover-hover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
