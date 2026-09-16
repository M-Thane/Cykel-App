import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { da } from './da'
import { en } from './en'
import type { Dict } from './da'

export type Lang = 'da' | 'en'

const DICTS: Record<Lang, Dict> = { da, en }
const LOCALES: Record<Lang, string> = { da: 'da-DK', en: 'en-GB' }
const STORAGE_KEY = 'cykel-app-lang'

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'da' || stored === 'en') return stored
  } catch {
    // localStorage unavailable — fall back to default
  }
  return 'da'
}

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Dict
  locale: string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<LanguageContextValue>(() => {
    return {
      lang,
      setLang: (l: Lang) => {
        setLangState(l)
        try {
          localStorage.setItem(STORAGE_KEY, l)
        } catch {
          // ignore
        }
      },
      t: DICTS[lang],
      locale: LOCALES[lang],
    }
  }, [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within a LanguageProvider')
  return ctx
}
