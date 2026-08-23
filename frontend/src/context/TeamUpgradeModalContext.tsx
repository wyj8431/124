import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface TeamUpgradeModalContextValue {
  isOpen: boolean
  openTeamUpgradeModal: () => void
  closeTeamUpgradeModal: () => void
}

const TeamUpgradeModalContext = createContext<TeamUpgradeModalContextValue | null>(null)

export function TeamUpgradeModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openTeamUpgradeModal = useCallback(() => setIsOpen(true), [])
  const closeTeamUpgradeModal = useCallback(() => setIsOpen(false), [])

  return (
    <TeamUpgradeModalContext.Provider
      value={{ isOpen, openTeamUpgradeModal, closeTeamUpgradeModal }}
    >
      {children}
    </TeamUpgradeModalContext.Provider>
  )
}

export function useTeamUpgradeModal() {
  const ctx = useContext(TeamUpgradeModalContext)
  if (!ctx) throw new Error('useTeamUpgradeModal must be used within TeamUpgradeModalProvider')
  return ctx
}
