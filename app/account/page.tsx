"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { User, LogOut } from 'lucide-react'
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { useAuth } from "@/hooks/useAuth"
import { useLocale } from "@/components/locale-provider"
import locales from "./locales.json"

interface UserData {
  id: string | number
  prenom: string
  nom: string
  email: string
}

export default function AccountPage() {
  const { locale } = useLocale()
  const t = locales[locale as keyof typeof locales]

  const [activeTab, setActiveTab] = useState("profile")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, logout } = useAuth()

  useEffect(() => {
    if (user) {
      setUserData({
        id: parseInt(user.id),
        prenom: user.firstName || "",
        nom: user.lastName || "",
        email: user.email || "",
      })
      setIsLoading(false)
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!userData) return null

  return (
    <div className="flex min-h-screen justify-center items-center flex-col">
      <Nav />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
                <div className="text-center">
                  <h3 className="text-xl font-bold">{userData.prenom} {userData.nom}</h3>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </div>
              </div>
              <nav className="flex flex-col space-y-1">
                <button
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${activeTab === "profile" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="h-4 w-4" />
                  {t.navProfile}
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  {t.navLogout}
                </button>
              </nav>
            </div>
            <div className="space-y-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{t.profileTitle}</h2>
                    <p className="text-muted-foreground">{t.profileSubtitle}</p>
                  </div>
                  <div className="space-y-4 rounded-lg border bg-background p-6 shadow-sm">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="first-name" className="text-sm font-medium">{t.firstName}</label>
                        <Input id="first-name" value={userData.prenom} onChange={(e) => setUserData({ ...userData, prenom: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="last-name" className="text-sm font-medium">{t.lastName}</label>
                        <Input id="last-name" value={userData.nom} onChange={(e) => setUserData({ ...userData, nom: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">{t.email}</label>
                      <Input id="email" type="email" value={userData.email} onChange={(e) => setUserData({ ...userData, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="bio" className="text-sm font-medium">{t.bio}</label>
                      <Textarea id="bio" defaultValue={t.bioDefault} rows={4} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
