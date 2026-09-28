/**
 * Human-readable rendering of audit-log `changes` payloads.
 * Localized `{ en, ar }` values resolve to the current UI language instead
 * of printing `[object Object]`; `{ from, to }` diffs render as `a → b`.
 */
function pickLocalized(value: { en?: unknown; ar?: unknown }, lang: string): string {
  const en = typeof value.en === 'string' ? value.en : '';
  const ar = typeof value.ar === 'string' ? value.ar : '';
  return lang === 'ar' ? ar || en : en || ar;
}

function truncate(text: string, max = 80): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export function displayAuditValue(value: any, lang: string): string {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return truncate(String(value));
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '-';
    return truncate(value.map((v) => displayAuditValue(v, lang)).join(', '));
  }
  if (typeof value === 'object') {
    if ('en' in value || 'ar' in value) {
      return pickLocalized(value, lang) || '-';
    }
    if ('from' in value || 'to' in value) {
      return `${displayAuditValue((value as any).from, lang)} → ${displayAuditValue((value as any).to, lang)}`;
    }
    const entries = Object.entries(value);
    if (entries.length === 0) return '-';
    return truncate(entries.map(([k, v]) => `${k}: ${displayAuditValue(v, lang)}`).join(', '));
  }
  return truncate(String(value));
}

export function displayAuditChanges(changes: any, lang: string): string {
  if (!changes) return '-';
  if (typeof changes === 'string') return changes;
  try {
    const entries = Object.entries(changes);
    if (entries.length === 0) return 'No changes';
    return entries.map(([key, value]) => `${key}: ${displayAuditValue(value, lang)}`).join(' · ');
  } catch {
    return '-';
  }
}
