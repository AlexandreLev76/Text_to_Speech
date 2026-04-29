"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, Mail, Lock } from 'lucide-react'
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { GoogleSignInButton } from "@/components/google-sign-in-button"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { toast } from "sonner"
import locales from "./locales.json"

const t = locales['fr']

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
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
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">
                  {t.email}
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemple@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium leading-none">
                    {t.password}
                  </label>
                  <a href="#" className="text-sm text-primary hover:underline">
                    {t.forgotPassword}
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label htmlFor="remember" className="text-sm font-medium leading-none">
                  {t.rememberMe}
                </label>
              </div>
              <Button type="submit" className="w-full gap-1" disabled={isLoading}>
                {isLoading ? t.submitting : t.submit} <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="relative flex items-center justify-center">
                <span className="absolute inset-x-0 h-px bg-muted" />
                <span className="relative bg-background px-2 text-xs text-muted-foreground">
                  {t.orContinueWith}
                </span>
              </div>
              <GoogleSignInButton />
              <div className="text-center text-sm">
                {t.noAccount}{" "}
                <Link href="/sign-up" className="text-primary hover:underline">
                  {t.signUp}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
