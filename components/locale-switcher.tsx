"use client"

import { useLocale } from "@/components/locale-provider"
import { routing } from "@/i18n/routing"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const LOCALE_LABELS: Record<string, string> = {
  fr: "🇫🇷 FR",
  en: "🇬🇧 EN",
  nl: "🇳🇱 NL",
  ja: "🇯🇵 JA",
}

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <Select value={locale} onValueChange={(v) => setLocale(v as typeof routing.locales[number])}>
      <SelectTrigger className="w-[90px] h-8 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((l) => (
          <SelectItem key={l} value={l}>{LOCALE_LABELS[l]}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
