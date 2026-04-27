import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { redis, TTL, KEYS } from '@/lib/redis';

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (token?.jti) {
    // Calcul du TTL restant du token pour ne pas stocker indéfiniment
    const exp = token.exp as number | undefined;
    const remainingTtl = exp ? Math.max(exp - Math.floor(Date.now() / 1000), 1) : TTL.JWT_BLACKLIST;

    await redis.set(KEYS.jwtBlacklist(token.jti as string), '1', { ex: remainingTtl });
    console.log('JWT blacklisté:', (token.jti as string).substring(0, 8));
  }

  return NextResponse.json({ success: true });
}
