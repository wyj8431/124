import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface FlagshipUpgradeModalContextValue {
  isOpen: boolean
  openFlagshipUpgradeModal: () => void
  closeFlagshipUpgradeModal: () => void
}

const FlagshipUpgradeModalContext = createContext<FlagshipUpgradeModalContextValue | null>(null)

export function FlagshipUpgradeModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openFlagshipUpgradeModal = useCallback(() => setIsOpen(true), [])
  const closeFlagshipUpgradeModal = useCallback(() => setIsOpen(false), [])

  return (
    <FlagshipUpgradeModalContext.Provider
      value={{ isOpen, openFlagshipUpgradeModal, closeFlagshipUpgradeModal }}
    >
      {children}
    </FlagshipUpgradeModalContext.Provider>
  )
}

export function useFlagshipUpgradeModal() {
  const ctx = useContext(FlagshipUpgradeModalContext)
  if (!ctx) throw new Error('useFlagshipUpgradeModal must be used within FlagshipUpgradeModalProvider')
  return ctx
}
