"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Volume2, Code, FileText, Mail, Github, Twitter, ExternalLink, BookOpen, MessageSquare, HelpCircle } from 'lucide-react'
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { useLocale } from "@/components/locale-provider"
import locales from "./locales.json"

export default function AboutPage() {
  const { locale } = useLocale()
  const t = locales[locale as keyof typeof locales]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Nav />
      <main className="flex-1 container py-8">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t.title}</h1>
              <p className="mt-4 text-muted-foreground md:text-xl">{t.subtitle}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t.objectiveTitle}</CardTitle>
                <CardDescription>{t.objectiveDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{t.objectiveBody}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>{t.obj1title}</strong> : {t.obj1desc}</li>
                  <li><strong>{t.obj2title}</strong> : {t.obj2desc}</li>
                  <li><strong>{t.obj3title}</strong> : {t.obj3desc}</li>
                  <li><strong>{t.obj4title}</strong> : {t.obj4desc}</li>
                  <li><strong>{t.obj5title}</strong> : {t.obj5desc}</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.stackTitle}</CardTitle>
                <CardDescription>{t.stackDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">{t.frontendTitle}</h3>
                    </div>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Next.js - React Framework</li>
                      <li>React - UI Library</li>
                      <li>Tailwind CSS</li>
                      <li>shadcn/ui</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">{t.ttsApisTitle}</h3>
                    </div>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>ElevenLabs</li>
                      <li>Google Cloud Text-to-Speech</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-muted p-4">
                  <h3 className="font-medium mb-2">{t.apiIntegrationTitle}</h3>
                  <p className="text-sm text-muted-foreground">{t.apiIntegrationBody}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.docsTitle}</CardTitle>
                <CardDescription>{t.docsDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="user-guide">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2"><BookOpen className="h-5 w-5" /><span>{t.userGuide}</span></div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-7 space-y-2">
                        <p className="text-sm text-muted-foreground">{t.userGuideDesc}</p>
                        <Button variant="outline" className="gap-2" asChild>
                          <Link href="#">{t.userGuideBtn} <ExternalLink className="h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="api-docs">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2"><Code className="h-5 w-5" /><span>{t.apiDocs}</span></div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-7 space-y-2">
                        <p className="text-sm text-muted-foreground">{t.apiDocsDesc}</p>
                        <Button variant="outline" className="gap-2" asChild>
                          <Link href="#">{t.apiDocsBtn} <ExternalLink className="h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="tutorials">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2"><FileText className="h-5 w-5" /><span>{t.tutorials}</span></div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-7 space-y-2">
                        <p className="text-sm text-muted-foreground">{t.tutorialsDesc}</p>
                        <Button variant="outline" className="gap-2" asChild>
                          <Link href="#">{t.tutorialsBtn} <ExternalLink className="h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2"><HelpCircle className="h-5 w-5" /><span>{t.faq}</span></div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-7 space-y-2">
                        <p className="text-sm text-muted-foreground">{t.faqDesc}</p>
                        <Button variant="outline" className="gap-2" asChild>
                          <Link href="#">{t.faqBtn} <ExternalLink className="h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.contactTitle}</CardTitle>
                <CardDescription>{t.contactDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">{t.emailSupport}</h3>
                        <p className="text-sm text-muted-foreground">
                          <Link href="mailto:support@speechcraft.com" className="hover:text-primary">support@speechcraft.com</Link>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">{t.liveChat}</h3>
                        <p className="text-sm text-muted-foreground">{t.liveChatHours}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium">{t.followUs}</h3>
                    <div className="flex gap-3">
                      <Button variant="outline" size="icon" asChild><Link href="#" aria-label="GitHub"><Github className="h-4 w-4" /></Link></Button>
                      <Button variant="outline" size="icon" asChild><Link href="#" aria-label="Twitter"><Twitter className="h-4 w-4" /></Link></Button>
                      <Button variant="outline" size="icon" asChild><Link href="mailto:support@speechcraft.com" aria-label="Email"><Mail className="h-4 w-4" /></Link></Button>
                    </div>
                    <div className="pt-2">
                      <Button className="w-full" asChild>
                        <Link href="#">{t.contactBtn}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
