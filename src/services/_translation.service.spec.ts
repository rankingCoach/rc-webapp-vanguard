import { afterEach, describe, expect, it } from 'vitest';

import { rcWindow } from '../stores/window.store';
import { translationService } from './translation.service';

const KEY = '%count% review without a reply.';

describe('translationService.get plural context', () => {
  afterEach(() => {
    delete rcWindow.TranslationsData;
  });

  it('uses the MANY value when the key has no ONE value (English)', () => {
    rcWindow.TranslationsData = { [`${KEY}_other`]: '%count% reviews without a reply.' };
    expect(translationService.get(KEY, { count: 53 }, 'other').value).toBe('53 reviews without a reply.');
    expect(translationService.get(KEY, { count: 1 }, 'one').value).toBe('1 review without a reply.');
  });

  it('falls back to the ONE value when the key has no MANY value', () => {
    rcWindow.TranslationsData = { [KEY]: '%count% Bewertung ohne Antwort.' };
    expect(translationService.get(KEY, { count: 53 }, 'other').value).toBe('53 Bewertung ohne Antwort.');
  });
});
