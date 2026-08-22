import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { runChatTurn } from '@/lib/chatFlow';
import { runChatTurnPostReplyEnrichment } from '@/lib/chatTurnPostReply';
import { holdingReply } from '@/lib/brainPolicy';
import { CRISIS_MESSAGE } from '@/lib/safetyCopy';
import { ALL_PROFILE_LANGUAGES } from '@/lib/languages';
import {
  authorizeElevenLabsCustomLlm,
  extractDhiraUidFromExtraBody,
  extractVoiceLanguageHint,
  isVoiceCustomLlmEnabled,
  latestUserMessage,
  voiceCustomLlmSecret,
} from '@/lib/elevenlabs/customLlmAuth';
import { encodeAssistantReplyAsSse, sseResponse } from '@/lib/elevenlabs/openaiSse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

type ChatCompletionBody = {
  messages?: unknown;
  model?: string;
  stream?: boolean;
  elevenlabs_extra_body?: unknown;
  custom_llm_extra_body?: unknown;
};

/**
 * POST /api/elevenlabs/v1/chat/completions
 *
 * ElevenLabs Custom LLM adapter — runs the same brain as Chat-With-Dhira (`POST /api/chat`).
 */
export async function POST(req: NextRequest) {
  if (!isVoiceCustomLlmEnabled()) {
    return NextResponse.json({ error: 'Voice Custom LLM is disabled' }, { status: 503 });
  }

  if (!voiceCustomLlmSecret()) {
    return NextResponse.json({ error: 'ELEVENLABS_CUSTOM_LLM_SECRET is not configured' }, { status: 503 });
  }

  if (!authorizeElevenLabsCustomLlm(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: ChatCompletionBody;
  try {
    body = (await req.json()) as ChatCompletionBody;
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const extra = body.elevenlabs_extra_body ?? body.custom_llm_extra_body;
  const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : 'dhira';
  const userMessage = latestUserMessage(body.messages);

  const uid = extractDhiraUidFromExtraBody(extra);
  if (!uid) {
    // Pre-connect pings may arrive before extra body is wired — never 400 or ElevenLabs drops the call.
    if (!userMessage) {
      return sseResponse(encodeAssistantReplyAsSse(' ', model));
    }
    return NextResponse.json({ error: 'dhira_uid is required in elevenlabs_extra_body' }, { status: 400 });
  }

  if (!userMessage) {
    // ElevenLabs may ping Custom LLM before the user speaks — must not 400 or the agent drops the call.
    return sseResponse(encodeAssistantReplyAsSse(' ', model));
  }

  const detectedLanguageHint = extractVoiceLanguageHint(extra, ALL_PROFILE_LANGUAGES);

  try {
    const { result, postReply } = await runChatTurn({
      uid,
      userMessage,
      channel: 'voice',
      detectedLanguageHint,
    });

    if (postReply) {
      try {
        after(() => runChatTurnPostReplyEnrichment(postReply));
      } catch {
        void runChatTurnPostReplyEnrichment(postReply);
      }
    }

    const replyText = result.crisis ? CRISIS_MESSAGE : result.reply;
    const stream = encodeAssistantReplyAsSse(replyText, model);
    return sseResponse(stream);
  } catch (err) {
    console.error('[api/elevenlabs/v1/chat/completions] error', err);
    const lang = detectedLanguageHint ?? 'english';
    return sseResponse(encodeAssistantReplyAsSse(holdingReply(lang), model));
  }
}
