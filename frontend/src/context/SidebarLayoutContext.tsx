import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { SIDEBAR_NAV_WIDTH, SIDEBAR_PANEL_WIDTH } from '@/components/layout/SidebarWorkspacePanel'

const STORAGE_KEY = 'ckt-workspace-expanded'

type SidebarLayoutContextValue = {
  workspaceExpanded: boolean
  toggleWorkspace: () => void
  sidebarOffset: number
}

const SidebarLayoutContext = createContext<SidebarLayoutContextValue | null>(null)

function readStoredExpanded(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === '0') return false
    if (raw === '1') return true
  } catch {
    // ignore
  }
  return true
}

export function SidebarLayoutProvider({ children }: { children: ReactNode }) {
  const [workspaceExpanded, setWorkspaceExpanded] = useState(readStoredExpanded)

  const toggleWorkspace = useCallback(() => {
    setWorkspaceExpanded((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  const sidebarOffset = workspaceExpanded
    ? SIDEBAR_NAV_WIDTH + SIDEBAR_PANEL_WIDTH
    : SIDEBAR_NAV_WIDTH

  const value = useMemo(
    () => ({ workspaceExpanded, toggleWorkspace, sidebarOffset }),
    [workspaceExpanded, toggleWorkspace, sidebarOffset],
  )

  return <SidebarLayoutContext.Provider value={value}>{children}</SidebarLayoutContext.Provider>
}

export function useSidebarLayout() {
  const ctx = useContext(SidebarLayoutContext)
  if (!ctx) {
    throw new Error('useSidebarLayout must be used within SidebarLayoutProvider')
  }
  return ctx
}
