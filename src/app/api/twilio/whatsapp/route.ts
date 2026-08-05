import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getStore } from '@/lib/store';
import {
  anthropicJSON,
  anthropicText,
  isLiveBrainEnabled,
  type ClaudeTurn,
} from '@/lib/anthropic';
import type { MoodLabel, TopicTag } from '@/lib/types';
import { normalizeMood, normalizeTopic, valenceForMood } from '@/lib/moodNormalize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DHIRA_SYSTEM_PROMPT = `You are Dhira — a warm, calm companion who listens when no one else is available, like a caring older sibling.
YOUR PURPOSE: Help the user feel heard, understood, and emotionally safe. You are NOT a therapist, doctor, or advisor. You listen, reflect, and invite the user to share more.
CORE IDENTITY: Warm, patient, non-judgmental. You speak like a trusted older sibling: gentle, grounded, close. You are an AI companion. You NEVER claim to be human.
LANGUAGE: English, Hindi, or Hinglish. If they speak in Hinglish, reply in natural Hinglish. Keep it simple and human. Never clinical.
HOW YOU RESPOND: Acknowledge what they said → Reflect the feeling softly → ask ONE gentle, open-ended question. Keep every reply short (2-3 sentences max).
STRICT DO-NOT RULES: Never give advice, diagnose, prescribe, act as a therapist, or minimise feelings. Never ask more than one question at a time.
CONTEXT: This is a WhatsApp conversation. Keep messages short and warm.`;

const MOOD_EXTRACTION_PROMPT = `Based on this conversation, extract:
1. The user's primary mood (one of: happy, sad, anxious, overwhelmed, angry, lonely, hopeful, neutral, calm, stressed)
2. The main topic (one of: work, family, relationships, health, finances, self, other)
3. A 1-sentence summary of what the user talked about
4. A carry-forward note for next time (1 sentence)

Reply ONLY as JSON: {"mood": "...", "topicTag": "...", "summary": "...", "carryForward": "..."}`;

const BYE_PATTERNS =
  /\b(bye|goodbye|alvida|ok bye|take care|cya|gtg|got to go|talk later|baad mein|good night|shubh ratri|ok thanks|that's all)\b/i;

/** Parse Twilio's URL-encoded webhook body */
async function parseTwilioBody(req: NextRequest): Promise<Record<string, string>> {
  const text = await req.text();
  const params: Record<string, string> = {};
  new URLSearchParams(text).forEach((v, k) => {
    params[k] = v;
  });
  return params;
}

/** Build a TwiML response */
function twiml(message: string): NextResponse {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')}</Message></Response>`;
  return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
}

/** Extract mood from conversation using the shared OpenRouter/Anthropic brain. */
async function extractMood(history: string): Promise<{
  mood: MoodLabel;
  topicTag: TopicTag;
  summary: string;
  carryForward: string;
}> {
  if (!isLiveBrainEnabled()) {
    return {
      mood: 'neutral',
      topicTag: 'self',
      summary: 'User had a conversation with Dhira.',
      carryForward: '',
    };
  }
  try {
    const result = await anthropicJSON<{
      mood?: string;
      topicTag?: string;
      summary?: string;
      carryForward?: string;
    }>({
      agent: 'moodTagging',
      system: 'You extract structured mood metadata. Reply with JSON only.',
      userContent: `${MOOD_EXTRACTION_PROMPT}\n\nConversation:\n${history}`,
      maxTokens: 200,
    });
    return {
      mood: normalizeMood(result.mood),
      topicTag: normalizeTopic(result.topicTag),
      summary: result.summary || 'User had a conversation with Dhira.',
      carryForward: result.carryForward || '',
    };
  } catch {
    return {
      mood: 'neutral',
      topicTag: 'self',
      summary: 'User had a conversation with Dhira.',
      carryForward: '',
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const params = await parseTwilioBody(req);
    const fromRaw = params.From ?? ''; // "whatsapp:+91xxxxxxxxxx"
    const body = (params.Body ?? '').trim();
    const phoneE164 = fromRaw.replace('whatsapp:', '').trim();

    if (!phoneE164 || !body) {
      return twiml("Hi! I didn't catch that. How are you feeling today?");
    }

    const store = getStore();

    // Find or create user profile by phone
    const profiles = await store.allProfiles();
    let profile = profiles.find((p) => p.phoneE164 === phoneE164);
    if (!profile) {
      const uidNew = randomUUID();
      await store.getOrCreateProfile(uidNew);
      await store.updateProfile(uidNew, {
        phoneE164,
        alias: 'Friend',
        preferredChannel: 'whatsapp',
        whatsappOptIn: true,
      });
      profile = await store.getOrCreateProfile(uidNew);
    }
    const uid = profile.id;

    // Save the incoming user message
    const now = new Date().toISOString();
    await store.addMessage({
      id: randomUUID(),
      profileId: uid,
      role: 'user',
      content: body,
      createdAt: now,
    });

    // Get recent conversation history (last 10 messages)
    const history = await store.getRecentMessages(uid, 10);
    const historyText = history
      .map((m) => `${m.role === 'user' ? 'User' : 'Dhira'}: ${m.content}`)
      .join('\n');

    // Detect goodbye → sync mood and send farewell
    if (BYE_PATTERNS.test(body)) {
      const { mood, topicTag, summary, carryForward } = await extractMood(historyText);

      await store.addMood({
        id: randomUUID(),
        profileId: uid,
        mood,
        valence: valenceForMood(mood),
        emotionalIntensity: 0.5,
        topicTag,
        source: 'chat',
        createdAt: now,
      });
      if (summary) {
        await store.addMemory({
          id: randomUUID(),
          profileId: uid,
          summary,
          mood,
          topicTag,
          carryForward: carryForward || '',
          createdAt: now,
        });
      }

      const farewell = 'Take care of yourself 🌙 Dhira is always here when you need to talk.';
      await store.addMessage({
        id: randomUUID(),
        profileId: uid,
        role: 'dhira',
        content: farewell,
        createdAt: new Date().toISOString(),
      });
      return twiml(farewell);
    }

    // Generate Dhira's response via the shared central brain
    const messages: ClaudeTurn[] = history.map((m) => ({
      role: m.role === 'dhira' ? 'assistant' : 'user',
      content: m.content,
    }));

    let reply =
      "I'm here. Tell me more whenever you're ready — no rush.";
    if (isLiveBrainEnabled()) {
      try {
        reply = await anthropicText({
          agent: 'primaryAgent',
          system: DHIRA_SYSTEM_PROMPT,
          messages,
          maxTokens: 150,
        });
      } catch (err) {
        console.error('[api/twilio/whatsapp] brain error', err);
      }
    }

    await store.addMessage({
      id: randomUUID(),
      profileId: uid,
      role: 'dhira',
      content: reply,
      createdAt: new Date().toISOString(),
    });

    return twiml(reply);
  } catch (err) {
    console.error('[api/twilio/whatsapp] error', err);
    return twiml('Dhira is here — something went a little sideways. Please try again in a moment. 🙏');
  }
}
