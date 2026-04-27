import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createHash } from 'crypto';
import { API_CONFIG } from '@/lib/configTTS';
import { authOptions } from '@/lib/auth';
import { redis, TTL, KEYS } from '@/lib/redis';

const RATE_LIMIT_MAX = 20; // requêtes par heure

export async function POST(request: Request) {
  try {
    const { text, settings } = await request.json();

    if (!text || !settings) {
      return NextResponse.json(
        { error: 'Le texte et les paramètres sont requis' },
        { status: 400 }
      );
    }

    if (!API_CONFIG.GOOGLE_TTS.API_KEY) {
      console.error('La clé API Google Text-to-Speech n\'est pas configurée');
      return NextResponse.json(
        { error: 'La clé API n\'est pas configurée' },
        { status: 500 }
      );
    }

    // --- Rate limiting ---
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const rateLimitKey = KEYS.rateLimit(session.user.id);
      const count = await redis.incr(rateLimitKey);
      if (count === 1) {
        await redis.expire(rateLimitKey, TTL.RATE_LIMIT_WINDOW);
      }
      if (count > RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: `Limite atteinte : ${RATE_LIMIT_MAX} conversions par heure` },
          { status: 429 }
        );
      }
    }

    // --- Cache TTS ---
    const cachePayload = JSON.stringify({ text, settings });
    const cacheHash = createHash('sha256').update(cachePayload).digest('hex');
    const cacheKey = KEYS.ttsCache(cacheHash);

    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      console.log('Cache hit TTS:', cacheHash.substring(0, 8));
      return NextResponse.json({ audioContent: cached, fromCache: true });
    }

    // --- Appel Google TTS ---
    const response = await fetch(
      `${API_CONFIG.GOOGLE_TTS.BASE_URL}${API_CONFIG.GOOGLE_TTS.ENDPOINTS.SYNTHESIZE}?key=${API_CONFIG.GOOGLE_TTS.API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: settings.language,
            ssmlGender: settings.gender
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: settings.pitch,
            speakingRate: settings.speakingRate,
            volumeGainDb: settings.volumeGainDb
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Erreur Google TTS:', error);
      return NextResponse.json(
        { error: error.error?.message || 'Une erreur est survenue lors de la conversion' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Mise en cache du résultat
    await redis.set(cacheKey, data.audioContent, { ex: TTL.TTS_CACHE });
    console.log('Cache set TTS:', cacheHash.substring(0, 8));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la conversion:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la conversion' },
      { status: 500 }
    );
  }
}
