/** Replace generic "User" at the start of memory summaries with the person's chosen alias. */
export function summaryWithAlias(summary: string, alias: string | undefined): string {
  const name = alias?.trim();
  if (!name || !summary) return summary;
  if (/^User\b/.test(summary)) return summary.replace(/^User\b/, name);
  if (/^The user\b/i.test(summary)) return summary.replace(/^The user\b/i, name);
  return summary;
}
