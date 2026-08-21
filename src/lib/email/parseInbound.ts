/** Strip quoted reply history from plain-text email bodies. */
export function extractReplyText(raw: string): string {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const kept: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (/^on .+ wrote:$/i.test(t)) break;
    if (/^-+\s*original message\s*-+$/i.test(t)) break;
    if (/^from:\s/i.test(t) && kept.length > 0) break;
    if (t.startsWith('>')) continue;
    kept.push(line);
  }
  return kept.join('\n').trim();
}

/** Parse "Name <email@x.com>" or bare email. */
export function parseEmailAddress(from: string): string | null {
  const angle = from.match(/<([^>]+)>/);
  const candidate = (angle?.[1] ?? from).trim().toLowerCase();
  if (!candidate.includes('@')) return null;
  return candidate;
}
