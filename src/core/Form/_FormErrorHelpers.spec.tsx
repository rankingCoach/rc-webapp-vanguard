import { describe, expect, it, vi } from 'vitest';
import { extractErrorScopes } from './extract-error-scopes';
import { extractSetErrorsFromConfig } from './FormElement/extract-set-errors-from-config';

/** F0: characterization of the exported Form error helpers (public in both package entries). */
describe('extractSetErrorsFromConfig', () => {
  it('string passError is returned as-is', () => {
    expect(extractSetErrorsFromConfig({ passError: 'Dev error' })).toBe('Dev error');
  });

  it('array passError picks the arrayPosition entry and also writes it into errors', () => {
    const cfg = { passError: ['e0', 'e1'], arrayPosition: 1 } as Parameters<typeof extractSetErrorsFromConfig>[0];
    expect(extractSetErrorsFromConfig(cfg)).toBe('e1');
    expect(cfg.errors).toEqual(['e1']);
    const missing = { passError: ['e0', null], arrayPosition: 1 } as Parameters<typeof extractSetErrorsFromConfig>[0];
    expect(extractSetErrorsFromConfig(missing)).toBe('');
  });

  it('array passError on a non-array field warns and returns empty; no passError returns empty', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(extractSetErrorsFromConfig({ passError: ['e0'] })).toBe('');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(extractSetErrorsFromConfig({})).toBe('');
    warn.mockRestore();
  });
});

describe('extractErrorScopes', () => {
  it('maps each validationErrors element with a jsonPath and message to its first result plus the request-body object at that path', () => {
    const request = {
      type: 'x/rejected',
      payload: {
        validationErrors: {
          objectType: 'ValidationErrors',
          elements: [
            {
              objectType: 'ValidationError',
              jsonPath: 'items[1].name',
              elements: [{ objectType: 'ValidationResult', propertyName: 'name', errorMessage: 'too_short' }],
            },
            { objectType: 'ValidationError', jsonPath: 'items[0]', elements: [{ objectType: 'ValidationResult' }] },
            { objectType: 'ValidationError', elements: [] },
          ],
        },
      },
      meta: { arg: { requestBody: { body: { items: [{ id: 'a' }, { id: 'b', name: { first: 'x' } }] } } } },
    };
    const result = extractErrorScopes(request as never);
    expect(result).toEqual([
      { objectType: 'ValidationResult', propertyName: 'name', errorMessage: 'too_short', info: { first: 'x' } },
    ]);
  });

  it('no validationErrors -> empty list', () => {
    expect(extractErrorScopes({ type: 'x', payload: {}, meta: { arg: { requestBody: {} } } } as never)).toEqual([]);
  });
});
