import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

async function getUser(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return new NextResponse("Non autorisé", { status: 401 })

  const user = await getUser(session.user.email)
  if (!user) return new NextResponse("Utilisateur non trouvé", { status: 404 })

  const favorites = await prisma.favoriteVoice.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(favorites)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return new NextResponse("Non autorisé", { status: 401 })

  const body = await request.json()
  const { voiceType, voiceId, voiceName, metadata } = body

  if (!voiceType || !voiceId || !voiceName) {
    return new NextResponse("Données manquantes", { status: 400 })
  }

  const user = await getUser(session.user.email)
  if (!user) return new NextResponse("Utilisateur non trouvé", { status: 404 })

  const favorite = await prisma.favoriteVoice.upsert({
    where: { userId_voiceType_voiceId: { userId: user.id, voiceType, voiceId } },
    update: { voiceName, metadata },
    create: { userId: user.id, voiceType, voiceId, voiceName, metadata },
  })

  return NextResponse.json(favorite, { status: 201 })
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return new NextResponse("Non autorisé", { status: 401 })

  const { voiceType, voiceId } = await request.json()
  if (!voiceType || !voiceId) return new NextResponse("Données manquantes", { status: 400 })

  const user = await getUser(session.user.email)
  if (!user) return new NextResponse("Utilisateur non trouvé", { status: 404 })

  await prisma.favoriteVoice.delete({
    where: { userId_voiceType_voiceId: { userId: user.id, voiceType, voiceId } },
  })

  return new NextResponse(null, { status: 204 })
}
