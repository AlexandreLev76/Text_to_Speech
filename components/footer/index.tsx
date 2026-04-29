"use client"

import { Volume2 } from "lucide-react"
import Link from "next/link"
import locales from "./locales.json"

const t = locales['fr']

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-10">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold">SpeechCraft</span>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} SpeechCraft. {t.rights}
        </p>
        <div className="flex gap-4">
          <Link href="/text-to-speech" className="text-sm text-muted-foreground hover:text-primary">{t.app}</Link>
          <Link href="/history" className="text-sm text-muted-foreground hover:text-primary">{t.history}</Link>
          <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">{t.about}</Link>
        </div>
      </div>
    </footer>
  )
}
