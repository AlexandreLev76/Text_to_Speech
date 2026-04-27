import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: 'Clé API ElevenLabs non configurée' }, { status: 500 });
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des voix' }, { status: response.status });
  }

  const { voices } = await response.json();

  const filtered = voices
    .filter((v: { category: string }) => v.category === 'premade')
    .map((v: { voice_id: string; name: string; labels: Record<string, string> }) => ({
      voiceId: v.voice_id,
      name: v.name,
      gender: v.labels?.gender || '',
      accent: v.labels?.accent || '',
      description: v.labels?.description || '',
      useCase: v.labels?.use_case || '',
    }));

  return NextResponse.json(filtered);
}
