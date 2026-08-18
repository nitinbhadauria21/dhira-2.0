/**
 * Smoke tests for ElevenLabs Custom LLM adapter helpers (Chat-With-Dhira parity).
 *
 *   npm run test:voice-custom-llm
 */
import { NextRequest } from 'next/server';
import {
  extractDhiraUidFromExtraBody,
  latestUserMessage,
} from '../src/lib/elevenlabs/customLlmAuth';
import { encodeAssistantReplyAsSse } from '../src/lib/elevenlabs/openaiSse';

process.env.DHIRA_VOICE_CUSTOM_LLM = 'true';
process.env.ELEVENLABS_CUSTOM_LLM_SECRET = 'test-secret-voice-parity';
process.env.DHIRA_ALLOW_OFFLINE = 'true';
process.env.OPENROUTER_API_KEY = '';
process.env.ANTHROPIC_API_KEY = '';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'dummy';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean, detail?: string) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function readSseText(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let out = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    out += decoder.decode(value, { stream: true });
  }
  return out;
}

console.log('\nVoice Custom LLM adapter\n');

check('extracts dhira_uid from elevenlabs extra body', extractDhiraUidFromExtraBody({ dhira_uid: 'user-abc' }) === 'user-abc');
check('extracts user_id fallback', extractDhiraUidFromExtraBody({ user_id: 'user-xyz' }) === 'user-xyz');
check('returns null for missing uid', extractDhiraUidFromExtraBody({}) === null);

check(
  'latest user message from OpenAI messages array',
  latestUserMessage([
    { role: 'system', content: 'sys' },
    { role: 'assistant', content: 'hi' },
    { role: 'user', content: '  kaise ho?  ' },
  ]) === 'kaise ho?',
);

(async () => {
  const { POST } = await import('../src/app/api/elevenlabs/v1/chat/completions/route');

  const sse = await readSseText(encodeAssistantReplyAsSse('Main sun rahi hoon.', 'dhira'));
  check('SSE includes assistant role chunk', sse.includes('"role":"assistant"'));
  check('SSE includes reply content', sse.includes('Main sun rahi hoon.'));
  check('SSE ends with DONE', sse.trimEnd().endsWith('data: [DONE]'));
  check('SSE includes finish_reason stop', sse.includes('"finish_reason":"stop"'));

  const req = new NextRequest('http://localhost/api/elevenlabs/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-secret-voice-parity',
    },
    body: JSON.stringify({
      model: 'dhira',
      stream: true,
      messages: [{ role: 'user', content: 'Hi Dhira' }],
      elevenlabs_extra_body: { dhira_uid: 'voice-parity-integration-user' },
    }),
  });

  const res = await POST(req);
  check('route returns 200 SSE', res.status === 200);
  check('route content-type is event-stream', (res.headers.get('content-type') ?? '').includes('text/event-stream'));
  const routeSse = await res.text();
  check('route streams non-empty Dhira reply', routeSse.includes('"content"') && routeSse.includes('data: [DONE]'));
  check('route uses channel app brain (offline holding or reply)', routeSse.length > 80);

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
})();
