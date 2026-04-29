import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { redis, KEYS } from '@/lib/redis';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

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
        const locale = routing.locales.find(l => pathname.startsWith(`/${l}`)) ?? routing.defaultLocale;
        const res = NextResponse.redirect(new URL(`/${locale}/login`, req.url));
        res.cookies.delete('next-auth.session-token');
        return res;
      }
    } catch {
      // Redis inaccessible : fail open
    }
  }

  // Determine locale and path without locale prefix
  const locale = routing.locales.find(l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`) ?? routing.defaultLocale;
  const pathnameWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '') || '/';

  // Redirect authenticated users away from auth pages
  if ((pathnameWithoutLocale === '/login' || pathnameWithoutLocale === '/sign-up') && token) {
    return NextResponse.redirect(new URL(`/${locale}/account`, req.url));
  }

  // Protect routes
  const protectedRoutes = ['/account', '/history', '/text-to-speech'];
  if (protectedRoutes.some(p => pathnameWithoutLocale.startsWith(p)) && !token) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
