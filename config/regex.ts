/**
 * A collection of Regular Expressions
 *
 * PS. Romanian "regex" would be King "X" in English :)
 */
export const REGEX = {
  invalidPathChars: /[^/.a-zA-Z0-9-?=~_&#]+[^/.a-zA-Z0-9-?=~_&#]*/,
  phone: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s.0-9]*$/,
  /**
   * Accepts internationalised (IDN) domains like `info@die-bänd.com` alongside plain ASCII ones.
   * `\p{L}\p{N}\p{M}` is used instead of a raw `\u00A1-\uFFFF` range on purpose: the range form also
   * sweeps in invisible format characters (zero-width space, BOM, U+FFFD), which would let an address
   * pasted out of Word or Outlook validate green and then fail at send time.
   * Local part stays ASCII — a unicode local part needs SMTPUTF8, which delivery can't rely on.
   */
  email:
    /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[\p{L}\p{N}\p{M}](?:[\p{L}\p{N}\p{M}-]{0,61}[\p{L}\p{N}\p{M}])?\.)+(?:\p{L}{2}|\p{L}[\p{L}\p{N}\p{M}-]{1,61}[\p{L}\p{N}\p{M}])$/u,
  url: /(?:https?:\/\/)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?/g, // Why not this ???
  // url: /[a-zA-Z0-9]+\.[a-zA-Z]+/g,
  // url: /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9_-]+(?:\.[a-zA-Z]+){1,}(?:\/[^\s]*)?(?:\?[^#\s]*)?(?:#[^\s]*)?/g,
  specialChars: /[@#<>|\[\]\{\}*`’±;]+|(\.){2,}/g,
  multipleSpaces: /\s{2,}/g,
  onlySpaces: /^\s{1,}$/g,
  exclamationMark: /!/g,
  textAfterCommaOrPeriod: /[,\.][^\s]/,
  fullCapitalization: /^([A-Z\s,.][A-Z\s,.]+)$/g,
  excessiveCapitalisation: /\b(?:\w*[A-Z]){2}\w*\b/,
  at: /@/g,
  domain: /^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i,
  path: /[^a-zA-Z0-9_\-À-ɏḀ-ỿ ]/g,
  fullStopMark: /\./g,
};
