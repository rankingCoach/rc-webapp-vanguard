// Ported from @mui/material@9.5.0 Select/SelectInput.js (MIT)
/**
 * Typeahead behavior (framework-free), matching MUI Select's closed typeahead: lower-cased label prefix search that
 * starts after the previous match, cycles through equal first letters on a repeated key, and resets after a pause
 * (the caller owns the timer; TYPEAHEAD_RESET_MS is the shipped value).
 */
export const TYPEAHEAD_RESET_MS = 750;

export interface TypeaheadOption<V = unknown> {
  label: string;
  value: V;
}

export const areEqualValues = (a: unknown, b: unknown): boolean => {
  if (typeof b === 'object' && b !== null) return a === b;
  return String(a) === String(b);
};

export const getMatchingOptionIndex = (options: TypeaheadOption[], search: string, startIndex = 0): number => {
  if (options.length === 0) return -1;
  const start = ((startIndex % options.length) + options.length) % options.length;
  for (let offset = 0; offset < options.length; offset += 1) {
    const index = (start + offset) % options.length;
    if (options[index].label.startsWith(search)) return index;
  }
  return -1;
};

export const canCycleRepeatedCharacter = (options: TypeaheadOption[], key: string): boolean =>
  !options.some((o) => o.label[0] === key && o.label[1] === key);

export const createTypeahead = () => {
  let buffer = '';
  let previousSearchIndex: number | null = null;
  let matchedIndex: number | null = null;
  return {
    get active() {
      return buffer !== '';
    },
    reset() {
      buffer = '';
      previousSearchIndex = null;
      matchedIndex = null;
    },
    /** Feed one printable key; returns the matched option index or -1. `selectedIndex` seeds a new session. */
    type(key: string, options: TypeaheadOption[], selectedIndex: number): number {
      if (buffer === '') previousSearchIndex = selectedIndex;
      const k = key.toLowerCase();
      if (buffer === k && canCycleRepeatedCharacter(options, k)) {
        buffer = '';
        previousSearchIndex = matchedIndex;
      }
      buffer += k;
      const index = getMatchingOptionIndex(options, buffer, (previousSearchIndex ?? -1) + 1);
      if (index !== -1) matchedIndex = index;
      return index;
    },
  };
};
