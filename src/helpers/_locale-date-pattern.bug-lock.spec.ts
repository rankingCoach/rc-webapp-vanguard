import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDatePatternFromLocale } from './locale';

/**
 * [bug-lock] (watchdog decision A, plan §36.2): rc-webapp passes dash locales (`localeFormatted`, "_" → "-"), but
 * the lookup is keyed by underscore locales, so every production DatePicker falls back to DD.MM.YYYY and logs a
 * console.error. Pre-existing; fixing it changes the visible date format per locale, which is a user decision. This
 * locks today's behaviour so the DatePicker port keeps it byte-for-byte. Not a promised contract.
 */
afterEach(() => {
  vi.restoreAllMocks();
});

describe('[bug-lock] getDatePatternFromLocale with rc-webapp dash locales', () => {
  for (const locale of ['de-DE', 'en-GB', 'en-US', 'de-AT', 'es-ES', 'en-IE']) {
    it(`${locale} → DD.MM.YYYY + console.error`, () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(getDatePatternFromLocale(locale)).toBe('DD.MM.YYYY');
      expect(error).toHaveBeenCalledWith('ERROR | getDatePatternFromLocale | Details: locale not found ', locale);
    });
  }
  it('underscore locales (the map keys) still resolve, without an error', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(getDatePatternFromLocale('en_US')).toBe('MM/DD/YYYY');
    expect(getDatePatternFromLocale('de_DE')).toBe('DD.MM.YYYY');
    expect(error).not.toHaveBeenCalled();
  });
});
