#!/usr/bin/env tsx
/**
 * One-shot Supabase setup for Dhira password reset (Cloud Agent / CI).
 * Requires SUPABASE_ACCESS_TOKEN in the environment.
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
run('configure:password-reset-template');
console.log('Password reset Supabase config complete.');
