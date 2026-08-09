/** E.164 from Twilio `From` / `To` (strips whatsapp: prefix). */
export function normalizePhoneE164(raw: string): string {
  let s = raw.trim().replace(/^whatsapp:/i, '').replace(/[\s-()]/g, '');
  if (!s) return '';
  if (!s.startsWith('+')) {
    if (/^91[0-9]{10}$/.test(s)) s = `+${s}`;
    else if (/^[0-9]{10}$/.test(s)) s = `+91${s}`;
    else s = `+${s}`;
  }
  return s;
}

/** Lookup keys for matching stored profile phones to Twilio From. */
export function phoneE164LookupVariants(e164: string): string[] {
  const primary = normalizePhoneE164(e164);
  if (!primary) return [];
  const set = new Set<string>([primary, primary.replace(/^\+/, '')]);
  if (primary.startsWith('+91') && primary.length === 13) {
    set.add(primary.slice(3));
    set.add(`91${primary.slice(3)}`);
  }
  return [...set];
}

/** Twilio Messages API `from` / `to` — always `whatsapp:+...`. */
export function normalizeTwilioWhatsAppAddress(e164OrPrefixed: string): string {
  const bare = normalizePhoneE164(e164OrPrefixed);
  const e164 = bare.startsWith('+') ? bare : `+${bare}`;
  return `whatsapp:${e164}`;
}
