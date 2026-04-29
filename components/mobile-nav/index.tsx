"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import locales from "./locales.json"

const t = locales['fr']

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="md:hidden flex justify-end">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">{t.toggleMenu}</span>
      </Button>
      {isOpen && (
        <div className="fixed top-0 right-0 inset-0 z-50 flex flex-col w-screen bg-background/95 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <span className="text-xl font-bold">SpeechCraft</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-6 w-6" />
              <span className="sr-only">{t.closeMenu}</span>
            </Button>
          </div>
          <nav className="flex flex-col w-full items-end gap-6 py-6 px-4">
            <Link href="/text-to-speech" className="text-lg w-full font-medium hover:text-primary" onClick={() => setIsOpen(false)}>{t.app}</Link>
            <Link href="/history" className="text-lg w-full font-medium hover:text-primary" onClick={() => setIsOpen(false)}>{t.history}</Link>
            <Link href="/about" className="text-lg w-full font-medium hover:text-primary" onClick={() => setIsOpen(false)}>{t.about}</Link>
            <div className="flex flex-col w-full gap-2 pt-4">
              {!user && (
                <Link href="/login" className="rounded-lg border border-black px-4 py-1 flex items-center justify-center text-lg font-medium transition-all duration-200 hover:border-primary hover:bg-primary hover:text-white w-full" onClick={() => setIsOpen(false)}>
                  {t.login}
                </Link>
              )}
              <Link href={user ? "/account" : "/sign-up"} className="w-full">
                <Button className="w-full" onClick={() => setIsOpen(false)}>{user ? t.profile : t.start}</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
