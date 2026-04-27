import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: 'Clé API ElevenLabs non configurée' }, { status: 500 });
  }

  const formData = await request.formData();
  const name = formData.get('name') as string;
  const file = formData.get('file') as File;

  if (!name || !file) {
    return NextResponse.json({ error: 'Nom et fichier audio requis' }, { status: 400 });
  }

  const elevenLabsForm = new FormData();
  elevenLabsForm.append('name', name);
  elevenLabsForm.append('files', file);

  const response = await fetch(`${ELEVENLABS_API_URL}/voices/add`, {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY },
    body: elevenLabsForm,
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { error: error.detail?.message || 'Erreur ElevenLabs lors du clonage' },
      { status: response.status }
    );
  }

  const { voice_id } = await response.json();

  const clonedVoice = await prisma.clonedVoice.create({
    data: {
      userId: parseInt(session.user.id),
      elevenLabsVoiceId: voice_id,
      name,
    },
  });

  return NextResponse.json(clonedVoice, { status: 201 });
}
