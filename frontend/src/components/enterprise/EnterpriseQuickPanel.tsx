import { Link } from 'react-router-dom'
import { HelpCircle, Palette, Receipt, UserPlus } from 'lucide-react'
import type { EnterpriseAccountOverview } from '@/types/enterprise'

const quickIcons: Record<string, typeof UserPlus> = {
  'user-plus': UserPlus,
  palette: Palette,
  receipt: Receipt,
  help: HelpCircle,
}

interface Props {
  items: EnterpriseAccountOverview['quickAccess']
}

export function EnterpriseQuickPanel({ items }: Props) {
  return (
    <aside className="enterprise-quick-panel">
      <h2 className="enterprise-quick-panel__title">快捷入口</h2>
      <div className="enterprise-quick-panel__list">
        {items.map((item) => {
          const Icon = quickIcons[item.icon] ?? HelpCircle
          const inner = (
            <>
              <span className={`enterprise-quick-panel__icon enterprise-quick-panel__icon--${item.code}`}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="enterprise-quick-panel__text">
                <p className="enterprise-quick-panel__name">{item.name}</p>
                <p className="enterprise-quick-panel__desc">{item.description}</p>
              </div>
            </>
          )
          return item.routePath ? (
            <Link key={item.code} to={item.routePath} className="enterprise-quick-panel__item">
              {inner}
            </Link>
          ) : (
            <div key={item.code} className="enterprise-quick-panel__item">
              {inner}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
