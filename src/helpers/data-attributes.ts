/** `data-*` attributes a component accepts and forwards to its DOM element (D2 DOM contract). */
export type DataAttributes = { 'data-slot'?: string } & { [key: `data-${string}`]: string | boolean | undefined };

/**
 * Returns only the `data-*` keys of `props`, so nothing else leaks to the DOM. `data-testid` (any casing) is excluded:
 * components own it through their `testId` prop, and callers that pass it directly were ignored before this existed.
 * Booleans follow the DOM contract: `true` becomes present-empty (`''`), `false` is omitted.
 */
export const pickDataAttributes = (props: object): DataAttributes => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!key.startsWith('data-') || key.toLowerCase() === 'data-testid') continue;
    if (value === false) continue;
    out[key] = value === true ? '' : value;
  }
  return out as DataAttributes;
};

/** Boolean state attribute value: present-empty when true, absent otherwise. */
export const dataFlag = (on: unknown): '' | undefined => (on ? '' : undefined);
