/**
 * Admin session helpers
 *
 * Session shape stored in localStorage:
 *   dhira_admin_session = JSON { email: string, role: 'admin' | 'viewer', ts: number }
 *
 * Role rules:
 *   'admin'  → full access to all admin dashboards
 *   anything else (or missing) → redirect to /admin/login
 */

export interface AdminSession {
  email: string;
  role: 'admin' | 'viewer';
  ts: number;
}

const SESSION_KEY = 'dhira_admin_session';
// Sessions expire after 8 hours
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    // Validate shape
    if (!session.email || !session.role || !session.ts) return null;
    // Check expiry
    if (Date.now() - session.ts > SESSION_TTL_MS) {
      clearAdminSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function setAdminSession(email: string, role: 'admin' | 'viewer'): void {
  if (typeof window === 'undefined') return;
  const session: AdminSession = { email, role, ts: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function isAdmin(session: AdminSession | null): boolean {
  return session?.role === 'admin';
}
