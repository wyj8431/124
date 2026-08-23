import { cn } from '@/utils'
import type { TemplateFilterGroup } from '@/types/templateCenter'

interface Props {
  groups: TemplateFilterGroup[]
  values: Record<string, string>
  onChange: (groupCode: string, optionCode: string) => void
}

/** 分类 / 场景 / 行业 三行筛选 */
export function TemplateCenterFilterRows({ groups, values, onChange }: Props) {
  return (
    <div className="tc-filter-rows">
      {groups.map((group) => (
        <div key={group.code} className="tc-filter-row">
          <span className="tc-filter-row__label">{group.name}：</span>
          <div className="tc-filter-row__options">
            {group.options.map((opt) => {
              const active = (values[group.code] ?? 'all') === opt.code
                || (group.code === 'scene' && !values[group.code] && opt.code === 'recommend')
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => onChange(group.code, opt.code)}
                  className={cn('tc-filter-chip', active && 'tc-filter-chip--active')}
                >
                  {opt.name}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
