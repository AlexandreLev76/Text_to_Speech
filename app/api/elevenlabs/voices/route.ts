import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const voices = await prisma.clonedVoice.findMany({
    where: { userId: parseInt(session.user.id) },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(voices);
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { id } = await request.json();

  const voice = await prisma.clonedVoice.findFirst({
    where: { id, userId: parseInt(session.user.id) },
  });

  if (!voice) {
    return NextResponse.json({ error: 'Voix introuvable' }, { status: 404 });
  }

  if (process.env.ELEVENLABS_API_KEY) {
    await fetch(`${ELEVENLABS_API_URL}/voices/${voice.elevenLabsVoiceId}`, {
      method: 'DELETE',
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY },
    });
  }

  await prisma.clonedVoice.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
