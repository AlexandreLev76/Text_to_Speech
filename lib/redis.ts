import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// TTL constants (in seconds)
export const TTL = {
  TTS_CACHE: 60 * 60 * 24,      // 24h
  RATE_LIMIT_WINDOW: 60 * 60,   // 1h
  JWT_BLACKLIST: 60 * 60 * 24 * 30, // 30 jours (durée max d'un JWT)
}

export const KEYS = {
  ttsCache: (hash: string) => `tts:cache:${hash}`,
  rateLimit: (userId: string) => `ratelimit:${userId}`,
  jwtBlacklist: (jti: string) => `jwt:blacklist:${jti}`,
}
