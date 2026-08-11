#!/usr/bin/env tsx
/**
 * One-shot Supabase password reset setup (Supabase only — default email template):
 * 1. Auth redirect URLs (site URL + allow list)
 * 2. Restore Supabase default recovery email template (ConfirmationURL)
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
run('restore:default-recovery-template');

console.log('Password reset Supabase config complete (default template + redirect URLs).');
