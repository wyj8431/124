import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface CreateDesignContextValue {
  showCreateModal: boolean
  openCreateModal: () => void
  closeCreateModal: () => void
}

const CreateDesignContext = createContext<CreateDesignContextValue | null>(null)

export function CreateDesignProvider({ children }: { children: ReactNode }) {
  const [showCreateModal, setShowCreateModal] = useState(false)

  const openCreateModal = useCallback(() => setShowCreateModal(true), [])
  const closeCreateModal = useCallback(() => setShowCreateModal(false), [])

  return (
    <CreateDesignContext.Provider value={{ showCreateModal, openCreateModal, closeCreateModal }}>
      {children}
    </CreateDesignContext.Provider>
  )
}

export function useCreateDesignModal() {
  const ctx = useContext(CreateDesignContext)
  if (!ctx) {
    throw new Error('useCreateDesignModal must be used within CreateDesignProvider')
  }
  return ctx
}
