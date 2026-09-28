/**
 * Locale-aware date + time for table cells and detail pages.
 * Uses the browser's timezone (the user's time) and formats per UI language:
 * English → US style, Arabic → Egyptian style (Arabic month names + digits).
 */
export function formatDateTime(value: unknown, lang: string): string {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value as string);
  if (isNaN(date.getTime())) return '-';
  const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

/**
 * Creation date for a row: first present field wins, falling back to the
 * ObjectId timestamp (exact creation time) for entities without a date field
 * (e.g. categories, users).
 */
export function objectIdTime(id: unknown): Date | null {
  const hex = typeof id === 'string' ? id : (id as any)?._id || (id as any)?.id;
  if (typeof hex !== 'string' || hex.length < 8) return null;
  const seconds = parseInt(hex.slice(0, 8), 16);
  return isNaN(seconds) ? null : new Date(seconds * 1000);
}

export function formatAddedOn(row: any, fields: string[], lang: string): string {
  for (const field of fields) {
    if (row?.[field]) return formatDateTime(row[field], lang);
  }
  const fallback = objectIdTime(row?._id || row?.id);
  return fallback ? formatDateTime(fallback, lang) : '-';
}
