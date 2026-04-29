import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { redis, KEYS } from '@/lib/redis';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: 'next-auth.session-token'
    });

    // Vérifier si le token est blacklisté (logout explicite)
    if (token?.jti) {
        try {
            const isBlacklisted = await redis.exists(KEYS.jwtBlacklist(token.jti as string));
            if (isBlacklisted) {
                const loginUrl = new URL('/login', req.url);
                const response = NextResponse.redirect(loginUrl);
                response.cookies.delete('next-auth.session-token');
                return response;
            }
        } catch {
            // Redis inaccessible : on laisse passer (fail open)
        }
    }

    // Rediriger les utilisateurs connectés depuis login/signup vers account
    if ((req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/sign-up') && token) {
        return NextResponse.redirect(new URL('/account', req.url));
    }

    // Rediriger les utilisateurs non connectés vers login
    const protectedRoutes = ['/account', '/history'];
    if (protectedRoutes.some(path => req.nextUrl.pathname.startsWith(path)) && !token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/account/:path*', '/history/:path*', '/login', '/sign-up']
};