/**
 * Normalize Dhira assistant text for chat display/storage.
 * Decorative emoji belong in UI chrome (memory banner, etc.), not in spoken replies.
 */
export function sanitizeDhiraReplyForDisplay(text: string): string {
  return text
    .replace(/\u{1F319}\s*/gu, '') // 🌙
    .replace(/\u{1F31C}\s*/gu, '') // 🌜
    .replace(/\u{1F31D}\s*/gu, '') // 🌝
    .replace(/\u{1F31E}\s*/gu, '') // 🌞
    .replace(/\s{2,}/g, ' ')
    .trim();
}
