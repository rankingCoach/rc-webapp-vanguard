/**
 * A collection of Regular Expressions
 *
 * PS. Romanian "regex" would be King "X" in English :)
 */
export const REGEX = {
  invalidPathChars: /[^/.a-zA-Z0-9-?=~_&#]+[^/.a-zA-Z0-9-?=~_&#]*/,
  phone: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s.0-9]*$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
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
