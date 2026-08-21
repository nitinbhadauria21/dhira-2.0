import { summaryWithAlias } from '@/lib/memoryDisplay';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

assert(
  summaryWithAlias('User feeling supported ahead of a presentation', 'Hemu') ===
    'Hemu feeling supported ahead of a presentation',
  'leading User swapped',
);

assert(
  summaryWithAlias('The user felt calmer after talking', 'Hemu') ===
    'Hemu felt calmer after talking',
  'leading The user swapped (case insensitive)',
);

assert(summaryWithAlias('Still processing work stress', 'Hemu') === 'Still processing work stress', 'no swap mid-text');

assert(summaryWithAlias('User feeling heavy', '') === 'User feeling heavy', 'empty alias unchanged');

console.log('memory-display tests passed');
