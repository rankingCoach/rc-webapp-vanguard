const SCIENTIFIC_NOTATION = /[eE]/;
const SIGN = /[-+]/g;
const LEADING_SIGN = /^[-+]/;

/** Keydown guard for number inputs: `e`/`E` (scientific notation) never get typed. */
export const isBlockedNumericKey = (key: string): boolean => key === 'e' || key === 'E';

export type NumericFieldState = { value: string; badInput: boolean };

/**
 * - `block`: reject the insertion.
 * - `allow`: let it through.
 * - `allow-verify`: let it through, then restore the previous value if the result isn't a number
 *   (a pasted "-3" is only valid where it lands at the start, which a number input can't tell us).
 */
export type NumericInsertionVerdict = 'block' | 'allow' | 'allow-verify';

/**
 * Decides a text insertion (typed char, paste, drop, IME text) into a number input from the
 * inserted text, the current value and `validity.badInput`. Number inputs expose no caret or
 * selection, so the position of the insertion is never used. A lone "-" (or "1.") reports
 * `value === ""` with `badInput === true`.
 */
export const classifyNumericInsertion = (data: string | null, state: NumericFieldState): NumericInsertionVerdict => {
  const text = (data ?? '').trim();
  if (SCIENTIFIC_NOTATION.test(text)) return 'block';
  const signs = text.match(SIGN)?.length ?? 0;
  if (signs === 0) return 'allow';
  if (signs > 1 || !LEADING_SIGN.test(text)) return 'block';
  if (state.badInput) return 'block';
  if (state.value === '') return 'allow';
  return text.length === 1 ? 'allow' : 'allow-verify';
};
