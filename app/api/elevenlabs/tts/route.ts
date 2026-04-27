import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: 'Clé API ElevenLabs non configurée' }, { status: 500 });
  }

  const { text, voiceId } = await request.json();

  if (!text || !voiceId) {
    return NextResponse.json({ error: 'Texte et voiceId requis' }, { status: 400 });
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { error: error.detail?.message || 'Erreur ElevenLabs lors de la synthèse' },
      { status: response.status }
    );
  }

  const audioBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(audioBuffer).toString('base64');

  return NextResponse.json({ audioContent: base64 });
}
