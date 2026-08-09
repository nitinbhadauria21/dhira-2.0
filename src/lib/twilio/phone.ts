/** E.164 from Twilio `From` / `To` (strips whatsapp: prefix). */
export function normalizePhoneE164(raw: string): string {
  return raw.trim().replace(/^whatsapp:/i, '').trim();
}

/** Twilio Messages API `from` / `to` — always `whatsapp:+...`. */
export function normalizeTwilioWhatsAppAddress(e164OrPrefixed: string): string {
  const bare = normalizePhoneE164(e164OrPrefixed);
  const e164 = bare.startsWith('+') ? bare : `+${bare}`;
  return `whatsapp:${e164}`;
}
