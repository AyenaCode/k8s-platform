// App-wide UI language. The backend serves bilingual content via ?lang=en|fr, and
// every content query key already includes the language — so flipping this value
// transparently refetches courses, exercises and missions in the chosen language.
// The choice is persisted to localStorage so it survives reloads.
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'fr'

const STORAGE_KEY = 'k8slab.lang'

function initialLang(): Lang {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'fr') return saved
  }
  return 'en'
}

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  toggle: () => void
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const toggle = useCallback(() => setLang(lang === 'en' ? 'fr' : 'en'), [lang, setLang])

  return <LangContext.Provider value={{ lang, setLang, toggle }}>{children}</LangContext.Provider>
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
