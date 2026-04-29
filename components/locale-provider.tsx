"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { routing } from "@/i18n/routing"

type Locale = typeof routing.locales[number]

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType>({
  locale: routing.defaultLocale as Locale,
  setLocale: () => {},
})

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(routing.defaultLocale as Locale)

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null
    if (saved && routing.locales.includes(saved)) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("locale", newLocale)
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
