'use client'

import { Button } from "@/components/ui/button"
import { Mic, Wand2, Globe2, Zap, CheckCircle2, Volume2, ArrowRight } from "lucide-react"
import { AudioDemo } from "@/components/audio-demo"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import locales from "./locales.json"

const t = locales['fr']

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Nav />
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    {t.hero.title}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {t.hero.subtitle}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    size="lg"
                    className="gap-1"
                    onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    {t.hero.trialBtn} <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Link href={user ? "/account" : "/sign-up"}>
                    <Button>{user ? t.hero.profileBtn : t.hero.startBtn}</Button>
                  </Link>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{t.hero.noCreditCard}</span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-6 shadow-lg">
                  <div className="absolute inset-0 bg-grid-white/10" />
                  <div className="relative flex h-full flex-col items-center justify-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <Volume2 className="h-12 w-12 text-primary" />
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-12 w-1.5 animate-pulse rounded-full bg-primary"
                            style={{ animationDelay: `${i * 0.1}s`, animationDuration: "0.8s" }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="w-full max-w-sm rounded-lg bg-background/80 p-4 backdrop-blur-sm">
                      <p className="text-center text-sm">{t.hero.demo}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">{t.features.badge}</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t.features.title}</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">{t.features.subtitle}</p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Mic, key: "natural" },
                { icon: Wand2, key: "custom" },
                { icon: Globe2, key: "multilang" },
                { icon: Zap, key: "fast" },
                { icon: CheckCircle2, key: "api" },
                { icon: Volume2, key: "export" },
              ].map(({ icon: Icon, key }) => {
                const feature = t.features[key as keyof typeof t.features] as { title: string; desc: string }
                return (
                  <div key={key} className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-center text-muted-foreground">{feature.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="demo" className="py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">{t.demo.badge}</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t.demo.title}</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">{t.demo.subtitle}</p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl py-12">
              <AudioDemo />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
