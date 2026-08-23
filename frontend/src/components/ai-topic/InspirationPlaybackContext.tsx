import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type InspirationPlaybackContextValue = {
  activeSectionId: number | null
  reportSectionVisibility: (sectionId: number, ratio: number) => void
}

const InspirationPlaybackContext = createContext<InspirationPlaybackContextValue | null>(null)

const MIN_ACTIVE_RATIO = 0.2

export function InspirationPlaybackProvider({ children }: { children: ReactNode }) {
  const ratiosRef = useRef<Map<number, number>>(new Map())
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null)

  const reportSectionVisibility = useCallback((sectionId: number, ratio: number) => {
    ratiosRef.current.set(sectionId, ratio)

    let bestId: number | null = null
    let bestRatio = MIN_ACTIVE_RATIO

    for (const [id, value] of ratiosRef.current) {
      if (value > bestRatio) {
        bestRatio = value
        bestId = id
      }
    }

    setActiveSectionId((current) => (current === bestId ? current : bestId))
  }, [])

  const value = useMemo(
    () => ({ activeSectionId, reportSectionVisibility }),
    [activeSectionId, reportSectionVisibility],
  )

  return (
    <InspirationPlaybackContext.Provider value={value}>
      {children}
    </InspirationPlaybackContext.Provider>
  )
}

export function useInspirationPlayback() {
  const context = useContext(InspirationPlaybackContext)
  if (!context) {
    throw new Error('useInspirationPlayback must be used within InspirationPlaybackProvider')
  }
  return context
}
