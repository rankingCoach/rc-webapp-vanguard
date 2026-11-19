// Ported from @mui/material@9.5.0 styles/createTransitions.js (MIT)
/**
 * Transition timing (framework-free), the MUI values Vanguard shipped: auto height-based duration and the Grow
 * (menu/popover) opacity + transform transition, as the exact inline strings MUI wrote.
 */
export const EASE_IN_OUT = 'cubic-bezier(0.4, 0, 0.2, 1)';

export const autoHeightDuration = (height: number): number => {
  if (!height) return 0;
  const c = height / 36;
  return Math.min(Math.round((4 + 15 * c ** 0.25 + c / 5) * 10), 3000);
};

const ms = (n: number) => `${Math.round(n)}ms`;
const create = (prop: string, duration: number, delay = 0, easing = EASE_IN_OUT) =>
  `${prop} ${ms(duration)} ${easing} ${ms(delay)}`;

export const growScale = (v: number) => `scale(${v}, ${v ** 2})`;
export const GROW_HIDDEN_TRANSFORM = growScale(0.75);

/** Inline `transition` for MUI Grow with timeout="auto" (duration from the element's clientHeight). */
export const growTransition = (mode: 'enter' | 'exit', clientHeight: number): string => {
  const d = autoHeightDuration(clientHeight);
  return [create('opacity', d), create('transform', d * 0.666, mode === 'exit' ? d * 0.333 : 0)].join(',');
};
