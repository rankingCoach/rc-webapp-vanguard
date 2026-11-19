/**
 * Joins class names with single spaces. Entries that are not strings (`false`, `true`, `undefined`, `null`, numbers)
 * or are empty / whitespace-only are dropped, so `cond && 'cls'` and unset props never render as `false` /
 * `undefined` tokens or stray spaces. For entries that are all non-empty strings the output equals `args.join(' ')`.
 */
export const classNames = (...args: Array<string | undefined | null | false | 0>): string => {
  return args.filter((a): a is string => typeof a === 'string' && a.trim() !== '').join(' ');
};

export const camelize = (s: any): any => {
  for (const key in s) {
    const camelized = key.replace(/-./g, (x: string) => x[1].toUpperCase());
    if (!s[camelized]) {
      s[camelized] = s[key];
    }
  }
  return s;
};
