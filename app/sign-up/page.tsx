"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, User, Mail, Lock } from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { GoogleSignInButton } from "@/components/google-sign-in-button"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { toast } from "sonner"
import { useLocale } from "@/components/locale-provider"
import locales from "./locales.json"

export default function SignupPage() {
  const { locale } = useLocale()
  const t = locales[locale as keyof typeof locales]

  const [prenom, setPrenom] = useState("")
  const [nom, setNom] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [terms, setTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) { toast.error(t.passwordMismatch); return }
    if (!terms) { toast.error(t.termsRequired); return }
    setIsLoading(true)
    try {
      await register(prenom, nom, email, password)
      toast.success(t.success)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen justify-center items-center flex-col">
      <Nav />
      <main className="flex-1 py-12 md:py-24 lg:py-32">
        <div className="container grid items-center justify-center gap-4 px-4 md:px-6">
          <div className="mx-auto w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">{t.title}</h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="first-name" className="text-sm font-medium leading-none">{t.firstName}</label>
                  <div className="relative">
                    <Input id="first-name" placeholder="Marie" className="pl-10" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="last-name" className="text-sm font-medium leading-none">{t.lastName}</label>
                  <Input id="last-name" placeholder="Dupont" value={nom} onChange={(e) => setNom(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">{t.email}</label>
                <div className="relative">
                  <Input id="email" type="email" placeholder="exemple@email.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">{t.password}</label>
                <div className="relative">
                  <Input id="password" type="password" placeholder="••••••••" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium leading-none">{t.confirmPassword}</label>
                <div className="relative">
                  <Input id="confirm-password" type="password" placeholder="••••••••" className="pl-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" checked={terms} onCheckedChange={(checked) => setTerms(checked as boolean)} />
                <label htmlFor="terms" className="text-sm font-medium leading-none">
                  {t.terms}{" "}
                  <Link href="#" className="text-primary hover:underline">{t.termsLink}</Link>
                  {" "}{t.and}{" "}
                  <Link href="#" className="text-primary hover:underline">{t.privacyLink}</Link>
                </label>
              </div>
              <Button type="submit" className="w-full gap-1" disabled={isLoading}>
                {isLoading ? t.submitting : t.submit} <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="relative flex items-center justify-center">
                <span className="absolute inset-x-0 h-px bg-muted" />
                <span className="relative bg-background px-2 text-xs text-muted-foreground">{t.orContinueWith}</span>
              </div>
              <GoogleSignInButton />
              <div className="text-center text-sm">
                {t.hasAccount}{" "}
                <Link href="/login" className="text-primary hover:underline">{t.login}</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
