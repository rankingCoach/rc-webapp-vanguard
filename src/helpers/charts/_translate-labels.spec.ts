import { translationService } from '@services/translation.service';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { translateLabels } from './translate-labels';

describe('translateLabels (shared by BarChart and HSBChart)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('translates every label in order through translationService', () => {
    const get = vi
      .spyOn(translationService, 'get')
      .mockImplementation((key: string) => ({ value: `t:${key}` }) as ReturnType<typeof translationService.get>);
    expect(translateLabels(['Mon', 'Tue', 'Mon'])).toEqual(['t:Mon', 't:Tue', 't:Mon']);
    expect(get.mock.calls.map((c) => c[0])).toEqual(['Mon', 'Tue', 'Mon']);
  });

  it('returns a new array and leaves the input untouched', () => {
    vi.spyOn(translationService, 'get').mockImplementation(
      (key: string) => ({ value: key.toUpperCase() }) as ReturnType<typeof translationService.get>,
    );
    const input = ['a', 'b'];
    const out = translateLabels(input);
    expect(out).toEqual(['A', 'B']);
    expect(out).not.toBe(input);
    expect(input).toEqual(['a', 'b']);
  });

  it('handles an empty list', () => {
    expect(translateLabels([])).toEqual([]);
  });
});
