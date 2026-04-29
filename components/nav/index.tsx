"use client"

import { Button } from "@/components/ui/button"
import { Volume2 } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import locales from "./locales.json"

const t = locales['fr']

export function Nav() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 left-0 z-40 w-full flex border-b bg-background items-center justify-center">
      <div className="container flex h-16 items-center justify-between py-4">
        <nav className="hidden md:flex items-center w-full justify-between gap-12">
          <div className="flex items-center gap-2 w-1/5">
            <Volume2 className="h-6 w-6 text-primary" />
            <Link href="/" className="text-xl font-bold">SpeechCraft</Link>
          </div>
          <div className="flex justify-evenly w-3/5">
            <Link href="/text-to-speech" className="text-sm font-medium hover:text-primary">{t.app}</Link>
            <Link href="/history" className="text-sm font-medium hover:text-primary">{t.history}</Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary">{t.about}</Link>
          </div>
          <div className="hidden md:flex items-center gap-3 w-1/5">
            {!user && (
              <Link href="/login" className="text-sm font-medium hover:text-primary">{t.login}</Link>
            )}
            <Link href={user ? "/account" : "/sign-up"}>
              <Button>{user ? t.profile : t.start}</Button>
            </Link>
          </div>
        </nav>
      </div>
      <div className="md:hidden flex w-full justify-end">
        <MobileNav />
      </div>
    </header>
  )
}
