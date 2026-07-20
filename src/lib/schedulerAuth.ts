/**
 * Shared auth for Emergent (and other schedulers) calling Dhira check-in APIs.
 *
 * Plain English: Emergent sends a shared password in the `x-checkin-secret`
 * header. If that password is set in the environment, it must match. If it is
 * not set, we fall back to the signed-in browser user (demo button).
 */
import { NextRequest } from 'next/server';
import { getUserId } from '@/lib/auth';

export async function resolveSchedulerUserId(
  req: NextRequest,
  body: { userId?: unknown },
): Promise<{ uid: string } | { error: string; status: number }> {
  const secret = process.env.CHECKIN_SECRET?.trim();
  const provided = req.headers.get('x-checkin-secret')?.trim();

  if (secret) {
    if (provided === secret) {
      if (typeof body.userId === 'string' && body.userId) {
        return { uid: body.userId };
      }
      return { error: 'userId is required', status: 400 };
    }
    // Secret is configured, but this request has no/wrong secret:
    // still allow the signed-in browser (Home "check in now" demo button).
    const sessionUid = await getUserId();
    if (sessionUid) return { uid: sessionUid };
    return { error: 'unauthorized', status: 401 };
  }

  const sessionUid = await getUserId();
  if (!sessionUid) return { error: 'unauthorized', status: 401 };
  return { uid: sessionUid };
}

/** For GET due-list: secret required when configured; otherwise 401. */
export function assertSchedulerSecret(req: NextRequest): { ok: true } | { error: string; status: number } {
  const secret = process.env.CHECKIN_SECRET?.trim();
  if (!secret) {
    // Dev convenience: allow due-list without secret when unset.
    return { ok: true };
  }
  const provided = req.headers.get('x-checkin-secret')?.trim();
  if (provided !== secret) return { error: 'unauthorized', status: 401 };
  return { ok: true };
}
