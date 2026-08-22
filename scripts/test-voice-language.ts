import { draftEchoesUserMessage, voiceAntiEchoFallback } from '@/lib/voice/antiEcho';
import {
  mapDhiraLanguageToElevenLabs,
  buildVoiceFirstMessage,
  resolveElevenLabsSessionLanguageOverride,
  dhiraLanguageFromElevenLabsCode,
} from '@/lib/voice/elevenLabsVoice';
import { languageForTurn } from '@/lib/inferLanguage';
import { extractVoiceLanguageHint } from '@/lib/elevenlabs/customLlmAuth';

let failed = 0;

function check(name: string, ok: boolean) {
  if (ok) console.log(`  ✓ ${name}`);
  else {
    console.error(`  ✗ ${name}`);
    failed += 1;
  }
}

console.log('\nVoice language mapping\n');
check('Telugu → te', mapDhiraLanguageToElevenLabs('telugu') === 'te');
check('English → en', mapDhiraLanguageToElevenLabs('english') === 'en');
check('Hinglish → hi', mapDhiraLanguageToElevenLabs('hinglish') === 'hi');
check(
  'Bilingual Profile skips ElevenLabs language lock',
  resolveElevenLabsSessionLanguageOverride('english', 'telugu') === null,
);
check(
  'Single language still maps session override',
  resolveElevenLabsSessionLanguageOverride('telugu', null) === 'te',
);
check(
  'ElevenLabs te → telugu when on Profile',
  dhiraLanguageFromElevenLabsCode('te', ['english', 'telugu']) === 'telugu',
);

console.log('\nVoice first message\n');
check('English opener', buildVoiceFirstMessage('Hemu', 'english').includes('Hemu'));

console.log('\nVoice channel language detection\n');
check(
  'Telugu script on voice channel',
  languageForTurn({
    channel: 'voice',
    userMessage: 'నమస్కారం',
    profileLanguage: 'english',
    profileLanguage2: 'telugu',
  }) === 'telugu',
);
check(
  'App channel unchanged for same input',
  languageForTurn({
    channel: 'app',
    userMessage: 'Hello there',
    profileLanguage: 'english',
    profileLanguage2: 'telugu',
  }) === 'english',
);
check(
  'Voice explicit telugu request',
  languageForTurn({
    channel: 'voice',
    userMessage: 'Can we speak in Telugu please',
    profileLanguage: 'english',
    profileLanguage2: 'telugu',
  }) === 'telugu',
);
check(
  'Voice romanized Telugu transcript',
  languageForTurn({
    channel: 'voice',
    userMessage: 'nenu baaga stress lo unna',
    profileLanguage: 'english',
    profileLanguage2: 'telugu',
  }) === 'telugu',
);
check(
  'ElevenLabs detected language hint',
  languageForTurn({
    channel: 'voice',
    userMessage: 'hello how are you',
    profileLanguage: 'english',
    profileLanguage2: 'telugu',
    detectedLanguageHint: 'telugu',
  }) === 'telugu',
);
check(
  'extractVoiceLanguageHint from extra body',
  extractVoiceLanguageHint({ detected_language: 'te' }, ['english', 'telugu']) === 'telugu',
);

console.log('\nAnti-echo guard\n');
check(
  'Detects sentence echo',
  draftEchoesUserMessage(
    'I am feeling very stressed about my presentation tomorrow',
    'It sounds like you are feeling very stressed about your presentation tomorrow.',
  ),
);
check(
  'Allows fresh reply',
  !draftEchoesUserMessage('I am feeling stressed', 'That sounds like a lot. What part feels heaviest?'),
);
check('Fallback is non-empty', voiceAntiEchoFallback('english').length > 10);

console.log(`\n${failed ? failed + ' failed' : 'All voice tests passed'}\n`);
process.exit(failed > 0 ? 1 : 0);
