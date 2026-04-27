"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, Download, Volume2, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { convertTextToSpeech } from "@/lib/text-to-speech"
import { VoiceSettings } from "@/types/tts"
import { toast } from "sonner"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

const LANGUAGES = [
  { code: "fr-FR", name: "Français" },
  { code: "en-US", name: "Anglais (États-Unis)" },
  { code: "en-GB", name: "Anglais (Royaume-Uni)" },
  { code: "es-ES", name: "Espagnol" },
  { code: "de-DE", name: "Allemand" },
  { code: "it-IT", name: "Italien" },
  { code: "pt-PT", name: "Portugais" },
  { code: "nl-NL", name: "Néerlandais" },
  { code: "pl-PL", name: "Polonais" },
  { code: "ru-RU", name: "Russe" },
  { code: "ja-JP", name: "Japonais" },
  { code: "ko-KR", name: "Coréen" },
  { code: "zh-CN", name: "Chinois (Simplifié)" },
  { code: "zh-TW", name: "Chinois (Traditionnel)" }
]

const VOICE_TONES = [
  { label: "Très grave", pitch: -20 },
  { label: "Grave", pitch: -10 },
  { label: "Bas", pitch: -5 },
  { label: "Normal", pitch: 0 },
  { label: "Haut", pitch: 5 },
  { label: "Aigu", pitch: 10 },
  { label: "Très aigu", pitch: 15 },
  { label: "Extrêmement aigu", pitch: 20 },
]

type ElevenLabsVoice = {
  voiceId: string
  name: string
  gender: string
  accent: string
  description: string
  useCase: string
}

export default function TextToSpeechPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // --- Standard TTS state ---
  const [text, setText] = useState("")
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    language: "fr-FR",
    gender: "FEMALE",
    pitch: 1,
    speakingRate: 1,
    volumeGainDb: 0
  })
  const [isConverting, setIsConverting] = useState(false)

  // --- Premium voice state ---
  const [premiumText, setPremiumText] = useState("")
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([])
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("")
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [isLoadingVoices, setIsLoadingVoices] = useState(false)
  const [isPremiumConverting, setIsPremiumConverting] = useState(false)

  // --- Shared audio state ---
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const audioRef = useRef<HTMLAudioElement>(null)

  const fetchVoices = async () => {
    setIsLoadingVoices(true)
    try {
      const res = await fetch('/api/elevenlabs/voices')
      if (res.ok) setVoices(await res.json())
    } finally {
      setIsLoadingVoices(false)
    }
  }

  // --- Standard TTS ---
  const handleConvert = async () => {
    if (!text.trim()) {
      toast.error("Veuillez entrer du texte à convertir")
      return
    }
    setIsConverting(true)
    try {
      const result = await convertTextToSpeech(text, voiceSettings)
      if (result.error) { toast.error(result.error); return }
      setAudioUrl(result.audioUrl)
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voiceSettings.gender.toLowerCase(),
          speed: voiceSettings.speakingRate,
          pitch: voiceSettings.pitch,
          audioUrl: result.audioUrl
        }),
      })
      toast.success("Conversion réussie !")
    } catch {
      toast.error("Une erreur est survenue lors de la conversion")
    } finally {
      setIsConverting(false)
    }
  }

  // --- Premium TTS ---
  const handlePremiumConvert = async () => {
    if (!premiumText.trim()) {
      toast.error("Veuillez entrer du texte à convertir")
      return
    }
    if (!selectedVoiceId) {
      toast.error("Veuillez sélectionner une voix")
      return
    }
    setIsPremiumConverting(true)
    try {
      const res = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: premiumText, voiceId: selectedVoiceId }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Erreur lors de la conversion")
        return
      }
      const { audioContent } = await res.json()
      const blobUrl = URL.createObjectURL(
        new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' })
      )
      setAudioUrl(blobUrl)

      const selectedVoice = voices.find(v => v.voiceId === selectedVoiceId)
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: premiumText,
          voice: selectedVoice?.name ?? 'elevenlabs',
          speed: 1,
          pitch: 1,
          audioUrl: blobUrl,
        }),
      })

      toast.success("Conversion réussie !")
    } catch {
      toast.error("Une erreur est survenue lors de la conversion")
    } finally {
      setIsPremiumConverting(false)
    }
  }

  // --- Audio player ---
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause() } else { audioRef.current.play() }
      setIsPlaying(!isPlaying)
    }
  }

  const handleDownload = () => {
    if (!audioUrl) return
    const link = document.createElement("a")
    link.href = audioUrl
    link.download = "text-to-speech.mp3"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getSpeedLabel = (speed: number) => {
    if (speed <= 0.5) return "Lent"
    if (speed >= 1.5) return "Rapide"
    return "Normal"
  }

  const getVolumeLabel = (volume: number) => {
    if (volume <= -6) return "Faible"
    if (volume >= 6) return "Fort"
    return "Normal"
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Nav />

      <main className="flex-1 container py-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Convertisseur Texte-Voix</CardTitle>
              <CardDescription>
                Utilisez une voix standard ou clonez votre propre voix.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="standard" onValueChange={() => setAudioUrl("")}>
                <TabsList className="mb-6 w-full">
                  <TabsTrigger value="standard" className="flex-1">Voix standard</TabsTrigger>
                  <TabsTrigger value="premium" className="flex-1">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Voix premium
                  </TabsTrigger>
                </TabsList>

                {/* ---- ONGLET VOIX STANDARD ---- */}
                <TabsContent value="standard" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="text-input">Texte à convertir</Label>
                    <Textarea
                      id="text-input"
                      placeholder="Entrez le texte que vous souhaitez convertir en parole..."
                      className="min-h-[150px] resize-y"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Langue</Label>
                        <Select value={voiceSettings.language} onValueChange={(v) => setVoiceSettings(p => ({ ...p, language: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map((l) => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Voix</Label>
                        <Select value={voiceSettings.gender} onValueChange={(v) => setVoiceSettings(p => ({ ...p, gender: v as "FEMALE" | "MALE" }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FEMALE">Femme</SelectItem>
                            <SelectItem value="MALE">Homme</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Ton de voix</Label>
                        <Select value={voiceSettings.pitch.toString()} onValueChange={(v) => setVoiceSettings(p => ({ ...p, pitch: parseFloat(v) }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {VOICE_TONES.map((t) => <SelectItem key={t.pitch} value={t.pitch.toString()}>{t.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Vitesse de lecture</Label>
                          <span className="text-sm text-muted-foreground">{getSpeedLabel(voiceSettings.speakingRate)}</span>
                        </div>
                        <Slider min={0.5} max={2} step={0.1} value={[voiceSettings.speakingRate]} onValueChange={([v]) => setVoiceSettings(p => ({ ...p, speakingRate: v }))} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Volume</Label>
                          <span className="text-sm text-muted-foreground">{getVolumeLabel(voiceSettings.volumeGainDb)}</span>
                        </div>
                        <Slider min={-6} max={6} step={1} value={[voiceSettings.volumeGainDb]} onValueChange={([v]) => setVoiceSettings(p => ({ ...p, volumeGainDb: v }))} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button onClick={handleConvert} disabled={!text.trim() || isConverting} className="w-full md:w-auto">
                      {isConverting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Conversion en cours...</> : <><RefreshCw className="mr-2 h-4 w-4" />Convertir en audio</>}
                    </Button>
                  </div>
                </TabsContent>

                {/* ---- ONGLET VOIX PREMIUM ---- */}
                <TabsContent value="premium" className="space-y-6">
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={fetchVoices} disabled={isLoadingVoices}>
                      {isLoadingVoices ? <Loader2 className="h-4 w-4 animate-spin" /> : "Charger les voix"}
                    </Button>
                  </div>

                  {voices.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 space-y-1">
                          <Label>Filtrer par genre</Label>
                          <Select value={genderFilter} onValueChange={setGenderFilter}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous</SelectItem>
                              <SelectItem value="male">Homme</SelectItem>
                              <SelectItem value="female">Femme</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 space-y-1">
                          <Label>Voix</Label>
                          <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
                            <SelectTrigger><SelectValue placeholder="Sélectionnez une voix" /></SelectTrigger>
                            <SelectContent>
                              {voices
                                .filter(v => genderFilter === "all" || v.gender.toLowerCase() === genderFilter)
                                .map(v => (
                                  <SelectItem key={v.voiceId} value={v.voiceId}>
                                    {v.name}{v.accent ? ` · ${v.accent}` : ""}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {selectedVoiceId && (() => {
                        const v = voices.find(v => v.voiceId === selectedVoiceId)
                        return v ? (
                          <div className="rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground flex gap-4">
                            {v.description && <span>{v.description}</span>}
                            {v.useCase && <span>· {v.useCase}</span>}
                          </div>
                        ) : null
                      })()}
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Texte à convertir</Label>
                      <Textarea
                        placeholder="Entrez le texte à convertir avec la voix premium..."
                        className="min-h-[150px] resize-y"
                        value={premiumText}
                        onChange={(e) => setPremiumText(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={handlePremiumConvert}
                      disabled={!premiumText.trim() || !selectedVoiceId || isPremiumConverting}
                      className="w-full"
                    >
                      {isPremiumConverting
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Conversion en cours...</>
                        : <><Sparkles className="mr-2 h-4 w-4" />Convertir en premium</>}
                    </Button>
                  </div>

                </TabsContent>
              </Tabs>

              {/* ---- PLAYER AUDIO PARTAGÉ ---- */}
              <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />

              <Separator className="my-6" />

              {audioUrl ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Audio généré</h3>
                        <Button variant="outline" size="icon" onClick={handleDownload} title="Télécharger l'audio">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={handlePlayPause}>
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <div className="relative h-2 flex-1 rounded-full bg-muted">
                          <div
                            className={`absolute h-full rounded-full bg-primary transition-all ${isPlaying ? 'animate-progress' : ''}`}
                            style={{ width: isPlaying ? '100%' : '0%' }}
                          />
                        </div>
                      </div>
                      {isPlaying && (
                        <div className="flex justify-center py-2">
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-5 w-5 text-primary" />
                            <div className="flex gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="h-6 w-1 animate-pulse rounded-full bg-primary"
                                  style={{ animationDelay: `${i * 0.1}s`, animationDuration: '0.8s' }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Volume2 className="mx-auto h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">Aucun audio généré</h3>
                  <p className="text-sm text-muted-foreground">
                    Vous n&apos;avez pas encore converti de texte en parole.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
