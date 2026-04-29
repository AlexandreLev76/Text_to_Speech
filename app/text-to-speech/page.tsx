"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, Download, Volume2, Loader2, RefreshCw, Sparkles, Heart } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { convertTextToSpeech } from "@/lib/text-to-speech"
import { VoiceSettings } from "@/types/tts"
import { toast } from "sonner"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import locales from "./locales.json"

const t = locales['fr']

type ElevenLabsVoice = {
  voiceId: string
  name: string
  gender: string
  accent: string
  description: string
  useCase: string
}

type FavoriteVoice = {
  id: number
  voiceType: string
  voiceId: string
  voiceName: string
  metadata: Record<string, string> | null
}

const LANGUAGE_CODES = ['fr-FR','en-US','en-GB','es-ES','de-DE','it-IT','pt-PT','nl-NL','pl-PL','ru-RU','ja-JP','ko-KR','zh-CN','zh-TW'] as const
const TONE_VALUES = [-20, -10, -5, 0, 5, 10, 15, 20] as const

export default function TextToSpeechPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  const [text, setText] = useState("")
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    language: "fr-FR", gender: "FEMALE", pitch: 1, speakingRate: 1, volumeGainDb: 0,
  })
  const [isConverting, setIsConverting] = useState(false)

  const [premiumText, setPremiumText] = useState("")
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([])
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("")
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [isLoadingVoices, setIsLoadingVoices] = useState(false)
  const [isPremiumConverting, setIsPremiumConverting] = useState(false)
  const [showOnlyFavoritesPremium, setShowOnlyFavoritesPremium] = useState(false)

  const [favorites, setFavorites] = useState<FavoriteVoice[]>([])
  const [showOnlyFavoritesStandard, setShowOnlyFavoritesStandard] = useState(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const audioRef = useRef<HTMLAudioElement>(null)

  const fetchFavorites = useCallback(async () => {
    const res = await fetch('/api/favorites')
    if (res.ok) setFavorites(await res.json())
  }, [])

  useEffect(() => { if (user) fetchFavorites() }, [user, fetchFavorites])

  const isFavorite = (voiceType: string, voiceId: string) =>
    favorites.some(f => f.voiceType === voiceType && f.voiceId === voiceId)

  const toggleFavorite = async (voiceType: string, voiceId: string, voiceName: string, metadata?: Record<string, string>) => {
    if (isFavorite(voiceType, voiceId)) {
      await fetch('/api/favorites', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voiceType, voiceId }) })
      setFavorites(prev => prev.filter(f => !(f.voiceType === voiceType && f.voiceId === voiceId)))
      toast.success(t.favoriteRemoved)
    } else {
      const res = await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voiceType, voiceId, voiceName, metadata }) })
      if (res.ok) { const fav = await res.json(); setFavorites(prev => [fav, ...prev]); toast.success(t.favoriteAdded) }
    }
  }

  const fetchVoices = async () => {
    setIsLoadingVoices(true)
    try {
      const res = await fetch('/api/elevenlabs/voices')
      if (res.ok) setVoices(await res.json())
    } finally { setIsLoadingVoices(false) }
  }

  const handleConvert = async () => {
    if (!text.trim()) { toast.error(t.emptyText); return }
    setIsConverting(true)
    try {
      const result = await convertTextToSpeech(text, voiceSettings)
      if (result.error) { toast.error(result.error); return }
      setAudioUrl(result.audioUrl)
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: voiceSettings.gender.toLowerCase(), speed: voiceSettings.speakingRate, pitch: voiceSettings.pitch, audioUrl: result.audioUrl }),
      })
      toast.success(t.convertSuccess)
    } catch {
      toast.error(t.convertError)
    } finally {
      setIsConverting(false)
    }
  }

  const handlePremiumConvert = async () => {
    if (!premiumText.trim()) { toast.error(t.emptyText); return }
    if (!selectedVoiceId) { toast.error(t.selectVoiceError); return }
    setIsPremiumConverting(true)
    try {
      const res = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: premiumText, voiceId: selectedVoiceId }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t.convertError)
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
        body: JSON.stringify({ text: premiumText, voice: selectedVoice?.name ?? 'elevenlabs', speed: 1, pitch: 1, audioUrl: blobUrl }),
      })
      toast.success(t.convertSuccess)
    } catch {
      toast.error(t.convertError)
    } finally {
      setIsPremiumConverting(false)
    }
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause() } else { audioRef.current.play() }
      setIsPlaying(!isPlaying)
    }
  }

  const handleDownload = () => {
    if (!audioUrl) return
    const link = document.createElement("a")
    link.href = audioUrl; link.download = "text-to-speech.mp3"
    document.body.appendChild(link); link.click(); document.body.removeChild(link)
  }

  const getSpeedLabel = (s: number) => s <= 0.5 ? t.speedSlow : s >= 1.5 ? t.speedFast : t.speedNormal
  const getVolumeLabel = (v: number) => v <= -6 ? t.volumeLow : v >= 6 ? t.volumeHigh : t.volumeNormal

  const standardVoiceId = `${voiceSettings.language}-${voiceSettings.gender}`
  const standardVoiceName = `${t.languages[voiceSettings.language as keyof typeof t.languages]} · ${voiceSettings.gender === "FEMALE" ? t.genderFemale : t.genderMale}`

  const filteredPremiumVoices = voices
    .filter(v => genderFilter === "all" || v.gender.toLowerCase() === genderFilter)
    .filter(v => !showOnlyFavoritesPremium || isFavorite("premium", v.voiceId))

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Nav />
      <main className="flex-1 container py-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>{t.title}</CardTitle>
              <CardDescription>{t.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="standard" onValueChange={() => setAudioUrl("")}>
                <TabsList className="mb-6 w-full">
                  <TabsTrigger value="standard" className="flex-1">{t.tabStandard}</TabsTrigger>
                  <TabsTrigger value="premium" className="flex-1">
                    <Sparkles className="mr-2 h-4 w-4" />{t.tabPremium}
                  </TabsTrigger>
                </TabsList>

                {/* STANDARD */}
                <TabsContent value="standard" className="space-y-6">
                  <div className="space-y-2">
                    <Label>{t.textLabel}</Label>
                    <Textarea placeholder={t.textPlaceholder} className="min-h-[150px] resize-y" value={text} onChange={(e) => setText(e.target.value)} />
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t.language}</Label>
                        <Select value={voiceSettings.language} onValueChange={(v) => setVoiceSettings(p => ({ ...p, language: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {LANGUAGE_CODES.map(code => (
                              <SelectItem key={code} value={code}>{t.languages[code]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t.voice}</Label>
                        <div className="flex items-center gap-2">
                          <Select value={voiceSettings.gender} onValueChange={(v) => setVoiceSettings(p => ({ ...p, gender: v as "FEMALE" | "MALE" }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FEMALE">{t.genderFemale}</SelectItem>
                              <SelectItem value="MALE">{t.genderMale}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" onClick={() => toggleFavorite("standard", standardVoiceId, standardVoiceName, { language: voiceSettings.language, gender: voiceSettings.gender })} title={isFavorite("standard", standardVoiceId) ? t.removeFavorite : t.addFavorite}>
                            <Heart className="h-4 w-4" fill={isFavorite("standard", standardVoiceId) ? "currentColor" : "none"} color={isFavorite("standard", standardVoiceId) ? "#ef4444" : "currentColor"} />
                          </Button>
                        </div>
                      </div>
                      {favorites.some(f => f.voiceType === "standard") && (
                        <Button variant={showOnlyFavoritesStandard ? "default" : "outline"} size="sm" onClick={() => setShowOnlyFavoritesStandard(p => !p)} className="w-full">
                          <Heart className="mr-2 h-3 w-3" fill={showOnlyFavoritesStandard ? "currentColor" : "none"} />
                          {showOnlyFavoritesStandard ? t.allSettings : t.myFavorites}
                        </Button>
                      )}
                      {showOnlyFavoritesStandard && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{t.savedFavorites}</Label>
                          <div className="flex flex-col gap-1">
                            {favorites.filter(f => f.voiceType === "standard").map(fav => (
                              <button key={fav.id} onClick={() => { const meta = fav.metadata as { language: string; gender: string } | null; if (meta) setVoiceSettings(p => ({ ...p, language: meta.language, gender: meta.gender as "FEMALE" | "MALE" })) }} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted text-left">
                                <span>{fav.voiceName}</span>
                                <Heart className="h-3 w-3 text-red-500" fill="currentColor" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t.tone}</Label>
                        <Select value={voiceSettings.pitch.toString()} onValueChange={(v) => setVoiceSettings(p => ({ ...p, pitch: parseFloat(v) }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {TONE_VALUES.map(pitch => (
                              <SelectItem key={pitch} value={pitch.toString()}>{t.tones[pitch.toString() as keyof typeof t.tones]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>{t.speed}</Label>
                          <span className="text-sm text-muted-foreground">{getSpeedLabel(voiceSettings.speakingRate)}</span>
                        </div>
                        <Slider min={0.5} max={2} step={0.1} value={[voiceSettings.speakingRate]} onValueChange={([v]) => setVoiceSettings(p => ({ ...p, speakingRate: v }))} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>{t.volume}</Label>
                          <span className="text-sm text-muted-foreground">{getVolumeLabel(voiceSettings.volumeGainDb)}</span>
                        </div>
                        <Slider min={-6} max={6} step={1} value={[voiceSettings.volumeGainDb]} onValueChange={([v]) => setVoiceSettings(p => ({ ...p, volumeGainDb: v }))} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={handleConvert} disabled={!text.trim() || isConverting} className="w-full md:w-auto">
                      {isConverting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.convertingBtn}</> : <><RefreshCw className="mr-2 h-4 w-4" />{t.convertBtn}</>}
                    </Button>
                  </div>
                </TabsContent>

                {/* PREMIUM */}
                <TabsContent value="premium" className="space-y-6">
                  <div className="flex justify-between items-center">
                    {voices.length > 0 && favorites.some(f => f.voiceType === "premium") && (
                      <Button variant={showOnlyFavoritesPremium ? "default" : "outline"} size="sm" onClick={() => setShowOnlyFavoritesPremium(p => !p)}>
                        <Heart className="mr-2 h-3 w-3" fill={showOnlyFavoritesPremium ? "currentColor" : "none"} />
                        {showOnlyFavoritesPremium ? t.allVoices : t.myFavorites}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={fetchVoices} disabled={isLoadingVoices} className="ml-auto">
                      {isLoadingVoices ? <Loader2 className="h-4 w-4 animate-spin" /> : t.loadVoices}
                    </Button>
                  </div>

                  {voices.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 space-y-1">
                          <Label>{t.filterGender}</Label>
                          <Select value={genderFilter} onValueChange={setGenderFilter}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{t.filterAll}</SelectItem>
                              <SelectItem value="male">{t.genderMale}</SelectItem>
                              <SelectItem value="female">{t.genderFemale}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 space-y-1">
                          <Label>{t.voice}</Label>
                          <div className="flex items-center gap-2">
                            <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
                              <SelectTrigger><SelectValue placeholder={t.selectVoice} /></SelectTrigger>
                              <SelectContent>
                                {filteredPremiumVoices.map(v => (
                                  <SelectItem key={v.voiceId} value={v.voiceId}>{v.name}{v.accent ? ` · ${v.accent}` : ""}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {selectedVoiceId && (() => {
                              const v = voices.find(v => v.voiceId === selectedVoiceId)
                              if (!v) return null
                              return (
                                <Button variant="ghost" size="icon" onClick={() => toggleFavorite("premium", v.voiceId, v.name, { gender: v.gender, accent: v.accent, description: v.description, useCase: v.useCase })} title={isFavorite("premium", v.voiceId) ? t.removeFavorite : t.addFavorite}>
                                  <Heart className="h-4 w-4" fill={isFavorite("premium", v.voiceId) ? "currentColor" : "none"} color={isFavorite("premium", v.voiceId) ? "#ef4444" : "currentColor"} />
                                </Button>
                              )
                            })()}
                          </div>
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
                      <Label>{t.textLabel}</Label>
                      <Textarea placeholder={t.textPlaceholder} className="min-h-[150px] resize-y" value={premiumText} onChange={(e) => setPremiumText(e.target.value)} />
                    </div>
                    <Button onClick={handlePremiumConvert} disabled={!premiumText.trim() || !selectedVoiceId || isPremiumConverting} className="w-full">
                      {isPremiumConverting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.convertingBtn}</> : <><Sparkles className="mr-2 h-4 w-4" />{t.convertPremiumBtn}</>}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <audio ref={audioRef} src={audioUrl || undefined} onEnded={() => setIsPlaying(false)} className="hidden" />
              <Separator className="my-6" />

              {audioUrl ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">{t.audioGenerated}</h3>
                        <Button variant="outline" size="icon" onClick={handleDownload} title={t.downloadAudio}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={handlePlayPause}>
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <div className="relative h-2 flex-1 rounded-full bg-muted">
                          <div className={`absolute h-full rounded-full bg-primary transition-all ${isPlaying ? 'animate-progress' : ''}`} style={{ width: isPlaying ? '100%' : '0%' }} />
                        </div>
                      </div>
                      {isPlaying && (
                        <div className="flex justify-center py-2">
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-5 w-5 text-primary" />
                            <div className="flex gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-6 w-1 animate-pulse rounded-full bg-primary" style={{ animationDelay: `${i * 0.1}s`, animationDuration: '0.8s' }} />
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
                  <h3 className="mt-2 text-lg font-medium">{t.noAudio}</h3>
                  <p className="text-sm text-muted-foreground">{t.noAudioDesc}</p>
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
