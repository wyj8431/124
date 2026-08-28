import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { useLocation } from 'react-router-dom'

export function BackToTopButton() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const container = document.querySelector<HTMLElement>('[data-app-scroll-container]')

    const handleScroll = () => {
      const containerTop = container?.scrollTop ?? 0
      setVisible(containerTop > 360 || window.scrollY > 360)
    }

    handleScroll()
    container?.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container?.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [location.pathname])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => {
        const container = document.querySelector<HTMLElement>('[data-app-scroll-container]')
        if (container) {
          container.scrollTo({ top: 0, behavior: 'smooth' })
        }
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      aria-label="返回顶部"
      title="返回顶部"
      className="app-back-to-top"
    >
      <ArrowUp className="h-6 w-6" strokeWidth={2.2} />
    </button>
  )
}
