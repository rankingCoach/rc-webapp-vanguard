// Ported from @mui/material@9.5.0 Select/SelectInput.js (MIT)
/**
 * Hit test for the "release after opening" pattern (framework-free), identical to MUI SelectInput: the event path or
 * target containment wins (synthetic events carry clientX/Y = 0), a zero-size element is never hit, otherwise the
 * point is tested against the rect grown by a 2px boundary.
 */
export const OPENING_MOUSE_UP_BOUNDARY_OFFSET = 2;

export const isMouseEventInsideElement = (event: MouseEvent, element: Element | null): boolean => {
  if (!element) return false;
  if (event.composedPath?.().includes(element)) return true;
  const target = event.target as Node | null;
  if (target?.nodeType && element.contains(target)) return true;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  const o = OPENING_MOUSE_UP_BOUNDARY_OFFSET;
  return (
    event.clientX >= rect.left - o &&
    event.clientX <= rect.right + o &&
    event.clientY >= rect.top - o &&
    event.clientY <= rect.bottom + o
  );
};
