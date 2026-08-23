import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface MembershipModalContextValue {
  isOpen: boolean
  openMembershipModal: (options?: { groupCode?: 'individual' | 'team'; tierCode?: string }) => void
  closeMembershipModal: () => void
  initialGroup?: 'individual' | 'team'
  initialTier?: string
}

const MembershipModalContext = createContext<MembershipModalContextValue | null>(null)

export function MembershipModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialGroup, setInitialGroup] = useState<'individual' | 'team'>('individual')
  const [initialTier, setInitialTier] = useState<string | undefined>()

  const openMembershipModal = useCallback((options?: { groupCode?: 'individual' | 'team'; tierCode?: string }) => {
    setInitialGroup(options?.groupCode ?? 'individual')
    setInitialTier(options?.tierCode)
    setIsOpen(true)
  }, [])

  const closeMembershipModal = useCallback(() => {
    setIsOpen(false)
    setInitialTier(undefined)
  }, [])

  return (
    <MembershipModalContext.Provider
      value={{ isOpen, openMembershipModal, closeMembershipModal, initialGroup, initialTier }}
    >
      {children}
    </MembershipModalContext.Provider>
  )
}

export function useMembershipModal() {
  const ctx = useContext(MembershipModalContext)
  if (!ctx) throw new Error('useMembershipModal must be used within MembershipModalProvider')
  return ctx
}
