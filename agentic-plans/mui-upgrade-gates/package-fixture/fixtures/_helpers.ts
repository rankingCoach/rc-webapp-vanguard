/**
 * Type-level helpers for the consumer fixtures. No runtime code.
 *
 * `Equal` is the strict variant (distinguishes `any` from everything else), so `Expect<Equal<X, string>>` fails
 * when X has silently degraded to `any`.
 */
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
export type Expect<T extends true> = T;
export type IsAny<T> = 0 extends 1 & T ? true : false;
export type NotAny<T> = IsAny<T> extends true ? false : true;

/** Keeps a value "used" without emitting anything meaningful. */
export const use = (..._values: unknown[]): void => undefined;
