/**
 * F4: a form setter result that applies itself (writes the Redux-free form store) instead of being dispatched.
 * Legacy slice setters are pure action creators (FormElement even calls `setStateValue` during render without
 * dispatching), so the F4 setters must be pure too: they return one of these and the seam runs it.
 */
const LOCAL_FORM_ACTION = Symbol.for('vanguard.localFormAction');

export type LocalFormAction = (() => void) & { [LOCAL_FORM_ACTION]: true };

export const localFormAction = (apply: () => void): LocalFormAction =>
  Object.assign(() => apply(), { [LOCAL_FORM_ACTION]: true as const });

export const isLocalFormAction = (value: unknown): value is LocalFormAction =>
  typeof value === 'function' && (value as Partial<LocalFormAction>)[LOCAL_FORM_ACTION] === true;

const BEFORE_ACTION = Symbol.for('vanguard.formBeforeAction');

/** F5: attach a submit-time check to a form action; `<Form action>` runs it in the submit event (before the transition). */
export const withBeforeAction = <F extends (...args: never[]) => unknown>(action: F, check: () => boolean): F =>
  Object.assign(((...args: Parameters<F>) => action(...args)) as F, { [BEFORE_ACTION]: check });

export const beforeActionOf = (action: unknown): (() => boolean) | undefined =>
  typeof action === 'function' ? (action as { [BEFORE_ACTION]?: () => boolean })[BEFORE_ACTION] : undefined;
