/**
 * Internal class-attribute builder for the own core, clsx semantics as MUI emits them: every part is split on
 * whitespace, empty / false / undefined / null parts dropped, tokens joined by single spaces, order kept. Callers'
 * className strings with empty conditional parts (`'a  b '`) come out clean. Not a public helper.
 */
export const cx = (...parts: unknown[]): string =>
  parts
    .flatMap((part) => (typeof part === 'string' ? part.split(/\s+/) : []))
    .filter((token) => token !== '')
    .join(' ');
