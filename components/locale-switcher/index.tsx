"use client"

import { useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const LOCALE_LABELS: Record<string, string> = {
  fr: "🇫🇷 FR",
  en: "🇬🇧 EN",
  nl: "🇳🇱 NL",
  ja: "🇯🇵 JA",
}

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <Select value={locale} onValueChange={handleChange}>
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
