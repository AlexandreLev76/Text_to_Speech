import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password || !(await bcrypt.compare(credentials.password, user.password))) {
            console.log("Échec d'authentification pour:", credentials.email)
            return null
          }

          console.log("Authentification réussie pour:", credentials.email)
          return {
            id: user.id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            name: `${user.firstName} ${user.lastName}`
          }
        } catch (error) {
          console.error("Erreur d'authentification:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 jours - pour correspondre à la session
  },
  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        try {
          let dbUser = await prisma.user.findUnique({ where: { email: profile.email } })

          if (!dbUser) {
            const googleProfile = profile as { given_name?: string; family_name?: string; picture?: string }
            dbUser = await prisma.user.create({
              data: {
                email: profile.email,
                firstName: googleProfile.given_name ?? profile.email.split('@')[0],
                lastName: googleProfile.family_name ?? '',
                image: googleProfile.picture ?? null,
              }
            })
          }

          const existingAccount = await prisma.account.findUnique({
            where: { provider_providerAccountId: { provider: 'google', providerAccountId: account.providerAccountId } }
          })
          if (!existingAccount) {
            await prisma.account.create({
              data: { userId: dbUser.id, provider: 'google', providerAccountId: account.providerAccountId }
            })
          }

          user.id = dbUser.id.toString()
          user.firstName = dbUser.firstName
          user.lastName = dbUser.lastName
        } catch (error) {
          console.error("Erreur signIn Google:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.email = user.email
        token.jti = randomUUID()
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.email = token.email as string
      }
      return session
    }
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Simplification du domaine pour éviter les problèmes
        domain: undefined
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error(`Erreur NextAuth [${code}]:`, metadata)
    },
    warn(code) {
      console.warn(`Avertissement NextAuth [${code}]`)
    }
  }
}