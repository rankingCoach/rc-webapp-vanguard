type NumericInputState = { value: string; validity: { badInput: boolean } };

const SCIENTIFIC_NOTATION = /[eE]/;
const LEADING_SIGN = /^\s*[-+]/;
const NON_LEADING_SIGN = /.[-+]/; // a +/- with any char before it (i.e. not at index 0)

/**
 * Whether a keystroke should be blocked in a number input. `e`/`E` are always
 * blocked; `+`/`-` are allowed only as a leading sign (into an empty field).
 *
 * Number inputs have no selection API, so "field empty" is our proxy for "this
 * sign is leading". `badInput` catches a lone `-` already typed (reports
 * `value === ""` but `badInput === true`) so a second sign (`--`) is blocked.
 */
export const isBlockedNumericKey = (key: string, input: NumericInputState): boolean => {
  if (key === 'e' || key === 'E') {
    return true;
  }
  if (key === '+' || key === '-') {
    return !(input.value === '' && !input.validity.badInput);
  }
  return false;
};

/**
 * Whether a paste should be rejected in a number input. Rejected when the text
 * contains `e`/`E` anywhere, a non-leading sign (`4+1`), or a leading sign while
 * the field already has content (`+3` pasted onto `-2` would give `-2+3`).
 */
export const numericPasteIsInvalid = (text: string, currentValue: string): boolean => {
  const trimmed = text.trim();
  if (SCIENTIFIC_NOTATION.test(trimmed) || NON_LEADING_SIGN.test(trimmed)) {
    return true;
  }
  return LEADING_SIGN.test(trimmed) && currentValue !== '';
};
