/**
 * Helpers for backend `localized` fields, which accept either a plain string
 * (`"Hello"` → stored as `{ en: "Hello", ar: "" }`) or an object
 * (`{ en: "Hello", ar: "مرحبا" }`).
 *
 * Forms keep two controls (EN + AR). On load `splitLocalized` spreads either
 * shape into both controls without losing a language; on save
 * `joinLocalized` sends a plain string when only EN is filled (exactly what
 * the app sent before bilingual editing) and an `{ en, ar }` object otherwise.
 */
export function splitLocalized(value: unknown): { en: string; ar: string } {
  if (value === null || value === undefined) return { en: '', ar: '' };
  if (typeof value === 'string') return { en: value, ar: '' };
  if (typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    return {
      en: typeof obj['en'] === 'string' ? (obj['en'] as string) : '',
      ar: typeof obj['ar'] === 'string' ? (obj['ar'] as string) : '',
    };
  }
  return { en: String(value), ar: '' };
}

export function joinLocalized(en: string | null | undefined, ar: string | null | undefined): string | { en: string; ar: string } {
  const e = en ?? '';
  const a = ar ?? '';
  return a ? { en: e, ar: a } : e;
}
