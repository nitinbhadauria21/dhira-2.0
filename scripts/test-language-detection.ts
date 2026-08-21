/**
 * Regression: bilingual Profile languages are detected from native script in chat/voice.
 * Run: npm run test:language-detection
 */
import { languageForTurn } from '@/lib/inferLanguage';
import { PREFERRED_LANGUAGE_OPTIONS, languagePromptInstruction } from '@/lib/languages';
import type { Language } from '@/lib/types';

const NATIVE_SAMPLES: Partial<Record<Language, string>> = {
  english: 'How are you today?',
  hindi: 'नमस्ते',
  telugu: 'నమస్కారం',
  tamil: 'வணக்கம்',
  marathi: 'नमस्कार',
  malayalam: 'നമസ്കാരം',
  odia: 'ନମସ୍କାର',
  bengali: 'নমস্কার',
  gujarati: 'નમસ્તે',
  assamese: 'নমস্কাৰ',
  kannada: 'ನಮಸ್ಕಾರ',
  punjabi: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
  hinglish: 'yaar kya haal hai',
};

let failed = 0;

for (const opt of PREFERRED_LANGUAGE_OPTIONS) {
  if (opt.value === 'english') continue;
  const sample = NATIVE_SAMPLES[opt.value];
  if (!sample) {
    console.error('MISSING SAMPLE', opt.value);
    failed++;
    continue;
  }
  const detected = languageForTurn({
    channel: 'app',
    userMessage: sample,
    profileLanguage: 'english',
    profileLanguage2: opt.value,
  });
  if (detected !== opt.value) {
    console.error('FAIL', opt.label, 'expected', opt.value, 'got', detected);
    failed++;
  } else {
    console.log('OK  ', opt.label);
  }
}

for (const opt of PREFERRED_LANGUAGE_OPTIONS) {
  const prompt = languagePromptInstruction(opt.value);
  if (opt.value === 'english' || opt.value === 'hindi') continue;
  if (!prompt.includes(opt.label)) {
    console.error('FAIL prompt missing label', opt.label);
    failed++;
  }
}

const enFromTeluguMain = languageForTurn({
  channel: 'app',
  userMessage: NATIVE_SAMPLES.english!,
  profileLanguage: 'telugu',
  profileLanguage2: 'english',
});
if (enFromTeluguMain !== 'english') {
  console.error('FAIL english as second language', enFromTeluguMain);
  failed++;
} else {
  console.log('OK  English when Telugu is main');
}

console.log('\n=== Voice (ElevenLabs Custom LLM uses channel app — same detection) ===');
const voiceTelugu = languageForTurn({
  channel: 'app',
  userMessage: NATIVE_SAMPLES.telugu!,
  profileLanguage: 'english',
  profileLanguage2: 'telugu',
});
if (voiceTelugu !== 'telugu') {
  console.error('FAIL voice path telugu detection', voiceTelugu);
  failed++;
} else {
  console.log('OK  Voice turn would use Telugu for Telugu transcript');
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${PREFERRED_LANGUAGE_OPTIONS.length} Profile languages covered.`);
