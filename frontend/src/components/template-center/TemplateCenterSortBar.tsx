import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils'
import type { TemplateExtraFilter, TemplateSortOption } from '@/types/templateCenter'

interface Props {
  sortOptions: TemplateSortOption[]
  extraFilters: TemplateExtraFilter[]
  activeSort: string
  extraValues: Record<string, string>
  bundleOnly: boolean
  onSortChange: (code: string) => void
  onExtraChange: (filterCode: string, optionCode: string) => void
  onBundleOnlyChange: (checked: boolean) => void
}

/** 排序 Tab + 颜色/用途/风格等下拉筛选 */
export function TemplateCenterSortBar({
  sortOptions,
  extraFilters,
  activeSort,
  extraValues,
  bundleOnly,
  onSortChange,
  onExtraChange,
  onBundleOnlyChange,
}: Props) {
  return (
    <div className="tc-sort-bar">
      <div className="tc-sort-bar__tabs">
        {sortOptions.map((opt) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => onSortChange(opt.code)}
            className={cn('tc-sort-tab', activeSort === opt.code && 'tc-sort-tab--active')}
          >
            {opt.name}
          </button>
        ))}
      </div>

      <div className="tc-sort-bar__extras">
        {extraFilters.map((filter) => {
          const current = extraValues[filter.code] ?? 'all'
          const currentLabel =
            filter.options.find((o) => o.code === current)?.name ?? filter.name
          return (
            <div key={filter.code} className="tc-extra-filter">
              <button type="button" className="tc-extra-filter__trigger">
                {filter.code === 'color' && current !== 'all' && (
                  <span
                    className="tc-extra-filter__dot"
                    style={{
                      background:
                        filter.options.find((o) => o.code === current)?.colorHex ?? '#1677ff',
                    }}
                  />
                )}
                {filter.code === 'color' && current === 'all' && (
                  <span className="tc-extra-filter__color-wheel" aria-hidden />
                )}
                <span>{current === 'all' ? filter.name : currentLabel}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <div className="tc-extra-filter__menu">
                {filter.options.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => onExtraChange(filter.code, opt.code)}
                    className={cn(
                      'tc-extra-filter__option',
                      current === opt.code && 'tc-extra-filter__option--active',
                    )}
                  >
                    {opt.colorHex && (
                      <span
                        className="tc-extra-filter__swatch"
                        style={{ background: opt.colorHex }}
                      />
                    )}
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        <label className="tc-bundle-check">
          <input
            type="checkbox"
            checked={bundleOnly}
            onChange={(e) => onBundleOnlyChange(e.target.checked)}
            className="sr-only"
          />
          <span className={cn('tc-bundle-check__box', bundleOnly && 'tc-bundle-check__box--checked')} />
          <span>只看套装</span>
        </label>
      </div>
    </div>
  )
}
