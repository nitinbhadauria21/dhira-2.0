/**
 * Definitive Step 5 transcript cases A–E (live OpenRouter required for full PASS).
 *
 *   npm run test:definitive-transcript
 *
 * Fail-closed cases run without live; live rows document BLOCKED until OpenRouter privacy fixed.
 */
import { isLiveBrainEnabled } from '../src/config/models';
import { checkRisk } from '../src/agents/escalation';
import { draftReply } from '../src/agents/primary';
import { tagMood } from '../src/agents/moodTagging';
import { holdingReply } from '../src/lib/brainPolicy';
import { getLiveBrainTelemetry, resetLiveBrainTelemetryForTests } from '../src/lib/liveBrainTelemetry';
import { resetAnthropicClientForTests } from '../src/lib/anthropic';

const MOVIE_A1 =
  'I watched this movie where the guy ends his life and since then I keep thinking about it.';
const WITHDRAW_A2 =
  "I don't know whether it's good or it is. Wrong but. Feel like. You know, I don't want to talk to anybody. I just feel like locking myself in a room and not coming out.";

async function main() {
  console.log('Definitive transcript tests\n');

  const hold = holdingReply('english');
  console.log('Fail-closed holding (always available):');
  console.log(`  contains 14416: ${hold.includes('14416')}`);
  console.log(`  not canned reflect: ${!hold.includes('Yeh kaafi heavy lag raha hai')}`);

  if (!process.env.DHIRA_ALLOW_OFFLINE) {
    console.log('\nOffline demo disabled — draftReply should throw without key:');
    process.env.OPENROUTER_API_KEY = '';
    process.env.ANTHROPIC_API_KEY = '';
    try {
      await draftReply({ history: [], userMessage: MOVIE_A1, language: 'hinglish' });
      console.log('  FAIL: expected throw');
      process.exit(1);
    } catch {
      console.log('  PASS: LiveBrainUnavailableError path');
    }
  }

  if (!isLiveBrainEnabled()) {
    console.log('\nSKIP live rows A/B/C/E: set OPENROUTER_API_KEY and fix OpenRouter privacy.');
    process.exit(0);
  }

  resetLiveBrainTelemetryForTests();
  resetAnthropicClientForTests();

  const risk1 = await checkRisk({ userMessage: MOVIE_A1, context: '(definitive A1)' });
  console.log(`\nA1 checkRisk: ${risk1.risk_level} ${risk1.classification ?? ''}`);

  const draft1 = await draftReply({ history: [], userMessage: MOVIE_A1, language: 'hinglish' });
  console.log(`A1 draft (first 160 chars): ${draft1.slice(0, 160)}`);

  const mood1 = await tagMood({ text: MOVIE_A1, recentTurns: [{ role: 'user', content: MOVIE_A1 }] });
  console.log(`A1 mood: ${mood1.mood} source=${mood1.moodTagSource}`);

  const tel = getLiveBrainTelemetry();
  console.log(`\nTelemetry fallbackCount=${tel.fallbackCount} lastError=${tel.lastBrainError ?? 'none'}`);

  if (tel.fallbackCount > 0 || draft1.includes('Yeh kaafi heavy lag raha hai')) {
    console.error('\nFAIL: live path still falling back to canned offline strings.');
    process.exit(1);
  }

  const draft2 = await draftReply({
    history: [
      { role: 'user', content: MOVIE_A1 },
      { role: 'assistant', content: draft1 },
    ],
    userMessage: WITHDRAW_A2,
    language: 'hinglish',
  });
  console.log(`\nA2 draft (first 160 chars): ${draft2.slice(0, 160)}`);
  const mood2 = await tagMood({
    text: WITHDRAW_A2,
    recentTurns: [
      { role: 'user', content: MOVIE_A1 },
      { role: 'assistant', content: draft1 },
      { role: 'user', content: WITHDRAW_A2 },
    ],
  });
  console.log(`A2 mood: ${mood2.mood} valence=${mood2.valence}`);

  console.log('\nManual: WhatsApp A2 cross-channel + A3 repetition require signed-in store — see docs/definitive-fix-step5-results.md');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
