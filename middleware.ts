import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { redis, KEYS } from '@/lib/redis';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.session-token',
  });

  // JWT blacklist check
  if (token?.jti) {
    try {
      const isBlacklisted = await redis.exists(KEYS.jwtBlacklist(token.jti as string));
      if (isBlacklisted) {
        const res = NextResponse.redirect(new URL('/login', req.url));
        res.cookies.delete('next-auth.session-token');
        return res;
      }
    } catch {
      // Redis inaccessible : fail open
    }
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === '/login' || pathname === '/sign-up') && token) {
    return NextResponse.redirect(new URL('/account', req.url));
  }

  // Protect routes
  const protectedRoutes = ['/account', '/history', '/text-to-speech'];
  if (protectedRoutes.some(p => pathname.startsWith(p)) && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
