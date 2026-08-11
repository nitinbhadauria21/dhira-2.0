#!/usr/bin/env tsx
/**
 * One-shot Supabase password reset setup:
 * 1. Auth redirect URLs
 * 2. Resend SMTP on Supabase (if RESEND_API_KEY + RESEND_FROM_EMAIL)
 * 3. Recovery email template (token_hash → /auth/confirm)
 */
import { spawnSync } from 'node:child_process';

function run(script: string) {
  const r = spawnSync('npm', ['run', script], {
    stdio: 'inherit',
    env: process.env,
    cwd: process.cwd(),
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run('ensure:supabase-auth-urls');

if (process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim()) {
  run('configure:resend-smtp');
  run('configure:password-reset-template');
} else {
  console.warn(
    'Skip SMTP + template: set RESEND_API_KEY and RESEND_FROM_EMAIL, then re-run configure:password-reset.',
  );
}

console.log('Password reset Supabase config complete.');
