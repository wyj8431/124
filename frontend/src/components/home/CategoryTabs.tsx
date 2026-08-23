import { useState } from 'react'
import type { TemplateCategory } from '@/types'

const defaultCategories = [
  '为你推荐', '七夕', '秋日合集', '公众号首图', '教育培训', '长图海报',
  '全屏海报', '邀请函', '早安', '简历', '招聘', '名片印刷',
  '商品主图', '直播背景', 'PPT', '图文带货', '奖状', '出海电商',
]

interface Props {
  categories?: TemplateCategory[]
  activeCategory: string
  onCategoryChange: (code: string) => void
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: Props) {
  const items = categories?.length
    ? categories.map((c) => ({ name: c.name, code: c.code }))
    : defaultCategories.map((name) => ({ name, code: name }))

  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? items : items.slice(0, 12)

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 px-6">
      {visible.map((cat) => (
        <button
          key={cat.code}
          onClick={() => onCategoryChange(cat.code)}
          className={`rounded-full px-3.5 py-1.5 text-xs transition ${
            activeCategory === cat.code
              ? 'bg-ckt-primary text-white'
              : 'bg-white text-ckt-text-secondary hover:bg-gray-50'
          }`}
        >
          {cat.name}
        </button>
      ))}
      {!showAll && items.length > 12 && (
        <button
          onClick={() => setShowAll(true)}
          className="rounded-full px-3 py-1.5 text-xs text-ckt-text-secondary hover:text-ckt-primary"
        >
          ···
        </button>
      )}
    </div>
  )
}
