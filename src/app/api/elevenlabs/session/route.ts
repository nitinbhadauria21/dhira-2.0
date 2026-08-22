import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';
import {
  buildVoiceFirstMessage,
  resolveElevenLabsSessionLanguageOverride,
} from '@/lib/voice/elevenLabsVoice';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_AGENT_ID = 'agent_1301kymjnjbpevba1tncfhmd5b0m';

function agentIdFromEnv(): string {
  return (
    process.env.ELEVENLABS_AGENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID?.trim() ||
    DEFAULT_AGENT_ID
  );
}

function elevenLabsApiKey(): string | null {
  const key = process.env.ELEVENLABS_API_KEY?.trim() ?? '';
  if (!key || key.includes('your-')) return null;
  return key;
}

async function voiceSessionExtras(uid: string) {
  const store = getStore();
  const profile = await store.getOrCreateProfile(uid);
  return {
    uid,
    customLlmEnabled: process.env.DHIRA_VOICE_CUSTOM_LLM === 'true',
    voice: {
      primaryLanguage: profile.language,
      secondaryLanguage: profile.language2,
      elevenLabsLanguage: resolveElevenLabsSessionLanguageOverride(profile.language),
      firstMessage: buildVoiceFirstMessage(profile.alias, profile.language),
    },
  };
}

/**
 * GET /api/elevenlabs/session
 *
 * Returns safe client options to start Talk to Dhira. When the agent requires
 * auth, the server fetches a signed WebSocket URL or WebRTC token using the
 * ElevenLabs API key (never exposed to the browser).
 */
export async function GET() {
  const uid = await getUserId();
  if (!uid) {
    return NextResponse.json({ error: 'Sign in to use Talk to Dhira.' }, { status: 401 });
  }

  const agentId = agentIdFromEnv();
  const apiKey = elevenLabsApiKey();
  const extras = await voiceSessionExtras(uid);

  if (apiKey) {
    const signedRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
      {
        headers: { 'xi-api-key': apiKey },
        cache: 'no-store',
      },
    );

    if (signedRes.ok) {
      const body = (await signedRes.json()) as { signed_url?: string };
      if (body.signed_url) {
        return NextResponse.json({
          agentId,
          connectionType: 'websocket' as const,
          signedUrl: body.signed_url,
          ...extras,
        });
      }
    }

    const tokenRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`,
      {
        headers: { 'xi-api-key': apiKey },
        cache: 'no-store',
      },
    );

    if (tokenRes.ok) {
      const body = (await tokenRes.json()) as { token?: string };
      if (body.token) {
        return NextResponse.json({
          agentId,
          connectionType: 'webrtc' as const,
          conversationToken: body.token,
          ...extras,
        });
      }
    }

    const detail = signedRes.ok ? await tokenRes.text() : await signedRes.text();
    console.error('[api/elevenlabs/session] ElevenLabs auth failed', detail.slice(0, 200));
    return NextResponse.json(
      { error: 'Voice agent could not be authorized. Check ELEVENLABS_API_KEY on the server.' },
      { status: 502 },
    );
  }

  return NextResponse.json({
    agentId,
    connectionType: 'webrtc' as const,
    ...extras,
  });
}
