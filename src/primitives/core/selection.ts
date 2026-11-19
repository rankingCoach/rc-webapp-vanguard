// Ported from @mui/material@9.5.0 ToggleButtonGroup/isValueSelected.js (MIT)
/**
 * Selection behavior (framework-free). Value semantics match the ToggleButtonGroup contract Vanguard shipped:
 * exclusive groups hold one value or null; multiple groups hold an array.
 */
export const isValueSelected = <T>(value: T | undefined, candidate: T | readonly T[] | null | undefined): boolean => {
  if (value === undefined || candidate === undefined || candidate === null) {
    return false;
  }
  if (Array.isArray(candidate)) {
    return candidate.includes(value);
  }
  return value === candidate;
};

export const nextExclusiveValue = <T>(current: T | null | undefined, clicked: T): T | null =>
  current === clicked ? null : clicked;

export const nextMultipleValue = <T>(current: T[] | T | null | undefined, clicked: T): T[] => {
  const list = Array.isArray(current) ? current : null;
  if (list?.includes(clicked)) {
    return list.filter((v, i) => i !== list.indexOf(clicked));
  }
  return list ? [...list, clicked] : [clicked];
};
