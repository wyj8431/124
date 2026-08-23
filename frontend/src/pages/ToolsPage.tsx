import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { MarketingToolSection } from '@/components/tools/MarketingToolSection'
import { ToolEditorPick } from '@/components/tools/ToolEditorPick'
import {
  TOOLS_EDITOR_PICK,
  TOOLS_PAGE_BANNER,
  TOOLS_SECTIONS,
  TOOLS_SMART_DESIGN_SECTION,
} from '@/data/toolsPageData'

export function ToolsPage() {
  const navigate = useNavigate()
  const { isLoggedIn, setShowLoginModal } = useAuth()

  const handleToolClick = useCallback(
    (title: string) => {
      if (title === 'AI抠图') {
        navigate('/editor/koutu?fmodule=fuction&fpage=home')
        return
      }
      if (title === 'AI海报' || title === 'AI海报/封面') {
        navigate('/designtools/aitopic/AIhaibao')
        return
      }
      if (!isLoggedIn) {
        setShowLoginModal(true)
        return
      }
      console.info('[tools]', title)
    },
    [isLoggedIn, navigate, setShowLoginModal],
  )

  return (
    <div className="tools-page">
      <div
        className="tools-page__main"
        style={{ backgroundImage: `url("${TOOLS_PAGE_BANNER}")` }}
      >
        <div className="tools-page__content-wrapper">
          <div className="tools-page__content">
            {TOOLS_SECTIONS.map((section) => (
              <MarketingToolSection
                key={section.title}
                section={section}
                onItemClick={handleToolClick}
              />
            ))}

            <ToolEditorPick
              title="电商爆款玩法 一键替换"
              items={TOOLS_EDITOR_PICK}
              onItemClick={handleToolClick}
            />

            <MarketingToolSection
              section={TOOLS_SMART_DESIGN_SECTION}
              onItemClick={handleToolClick}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
