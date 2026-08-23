import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { EnterpriseAccountOverview, EnterpriseNavItem } from '@/types/enterprise'
import { cn } from '@/utils'

interface Props {
  navItems: EnterpriseNavItem[]
  promoCard?: EnterpriseAccountOverview['promoCard']
}

function NavLink({ item }: { item: EnterpriseNavItem }) {
  const location = useLocation()
  if (!item.routePath) return null

  const active = location.pathname === item.routePath
  return (
    <Link
      to={item.routePath}
      className={cn('enterprise-sidebar__link', active && 'enterprise-sidebar__link--active')}
    >
      <span>{item.name}</span>
      {item.badgeText ? (
        <span className="enterprise-sidebar__badge">{item.badgeText}</span>
      ) : null}
    </Link>
  )
}

export function EnterpriseSidebar({ navItems, promoCard }: Props) {
  return (
    <aside className="enterprise-sidebar">
      <nav className="enterprise-sidebar__nav">
        {navItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0

          if (!hasChildren) {
            return (
              <div key={item.code} className="enterprise-sidebar__section">
                <NavLink item={item} />
              </div>
            )
          }

          return (
            <div key={item.code} className="enterprise-sidebar__section">
              <div className="enterprise-sidebar__group-title">{item.name}</div>
              {item.children!.map((child) => (
                <NavLink key={child.code} item={child} />
              ))}
            </div>
          )
        })}
      </nav>

      {promoCard ? (
        <Link to={promoCard.ctaLink} className="enterprise-sidebar__promo">
          <div className="enterprise-sidebar__promo-icon" />
          <div className="enterprise-sidebar__promo-text">
            <span className="enterprise-sidebar__promo-title">{promoCard.title}</span>
            <span className="enterprise-sidebar__promo-subtitle">{promoCard.subtitle}</span>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-[#8f959e]" />
        </Link>
      ) : null}
    </aside>
  )
}
