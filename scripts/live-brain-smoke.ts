/**
 * Live brain smoke — OpenRouter reachability + agent calls when keys are set.
 *
 *   npm run test:live-brain-smoke
 *
 * Does not replace manual chat UI checks (movie transcript, Monitor sent-replies).
 */
import { isLiveBrainEnabled, getModelFor, getBrainApiKey, getBrainBaseURL, getOpenRouterProviderPrefs } from '../src/config/models';
import { checkRisk } from '../src/agents/escalation';
import { draftReply } from '../src/agents/primary';
import { tagMood } from '../src/agents/moodTagging';
import { getLiveBrainTelemetry, resetLiveBrainTelemetryForTests } from '../src/lib/liveBrainTelemetry';
import { resetAnthropicClientForTests } from '../src/lib/anthropic';

async function pingOpenRouter(): Promise<{ ok: boolean; status: number; snippet: string }> {
  const key = getBrainApiKey();
  const base = getBrainBaseURL() || 'https://openrouter.ai/api';
  const url = `${base.replace(/\/$/, '')}/v1/messages`;
  const model = getModelFor('primaryAgent');
  const provider = getOpenRouterProviderPrefs();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4028',
      'X-Title': 'Dhira live-brain-smoke',
    },
    body: JSON.stringify({
      model,
      max_tokens: 16,
      messages: [{ role: 'user', content: 'Reply with exactly: pong' }],
      ...(provider ? { provider } : {}),
    }),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, snippet: text.slice(0, 240) };
}

async function main() {
  console.log('Live brain smoke\n');
  if (!isLiveBrainEnabled()) {
    console.log('SKIP: no OPENROUTER_API_KEY / ANTHROPIC_API_KEY — offline mode only.');
    process.exit(0);
  }

  resetLiveBrainTelemetryForTests();
  resetAnthropicClientForTests();

  const ping = await pingOpenRouter();
  console.log(`OpenRouter ping: HTTP ${ping.status}${ping.ok ? ' OK' : ''}`);
  if (!ping.ok) console.log(`  body: ${ping.snippet}`);

  const movie1 =
    'I watched this movie where the guy ends his life and since then I keep thinking about it.';
  const risk = await checkRisk({
    userMessage: movie1,
    context: '(smoke test)',
  });
  console.log(`checkRisk(movie1): ${risk.risk_level} ${risk.classification ?? ''}`);

  const draft = await draftReply({
    history: [],
    userMessage: movie1,
    language: 'hinglish',
  });
  console.log(`draftReply(movie1): ${draft.slice(0, 120)}…`);

  const mood = await tagMood({
    text: movie1,
    recentTurns: [{ role: 'user', content: movie1 }],
    channel: 'app',
  });
  console.log(
    `tagMood(movie1): ${mood.mood} valence=${mood.valence} source=${mood.moodTagSource}`
  );

  const tel = getLiveBrainTelemetry();
  console.log(
    `\nTelemetry: fallbackCount=${tel.fallbackCount} lastBrainError=${tel.lastBrainError ?? 'none'}`
  );

  if (!ping.ok || tel.fallbackCount > 0) {
    console.error(
      '\nFAIL: live path blocked — fix OpenRouter privacy/credits or key on Vercel. See docs/live-brain-step1-diagnosis.md'
    );
    process.exit(1);
  }
  console.log('\nPASS: live agents responded without fallback.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
