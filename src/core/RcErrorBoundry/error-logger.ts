/**
 * One error log entry, as Vanguard used to PUT it to `/rest_api/v1/log` itself (VAN-64): the consumer now sends it
 * wherever its own API lives.
 */
export type VanguardErrorLogEntry = {
  /** The caller's error details (the ErrorModal's `err`, a React `ErrorInfo`, …). */
  info?: unknown;
  /** The error's name. */
  error?: string;
  /** The error's message, at most 100 characters. */
  message?: string;
  href: string;
  host: string;
  pathname: string;
  /** A trimmed copy of the Redux state, when a store was given. */
  state?: unknown;
  /** Where in the app it happened (e.g. `AI_ASSISTANT`, `ErrorBoundry`). */
  source?: string;
};

/**
 * Sends Vanguard's error logs (`type`: e.g. `error_modal_logs`) to the consumer's API. Whatever it returns (or resolves
 * to) is what `generateErrorBoundaryData`'s Observable emits. It may throw or reject: Vanguard never lets that reach
 * the screen.
 */
export type VanguardErrorLogger = (type: string, entry: VanguardErrorLogEntry) => unknown;

/** Live registrations, oldest first: the last one is active. Each is its own object, so a teardown finds only itself. */
let registrations: { logger: VanguardErrorLogger }[] = [];

const activeLogger = (): VanguardErrorLogger | null => registrations[registrations.length - 1]?.logger ?? null;

/** A consumer logger is registered: Vanguard logs through it instead of its deprecated built-in request. */
export const hasVanguardErrorLogger = (): boolean => activeLogger() !== null;

/**
 * Registers the consumer's error logger: Vanguard then logs through it and makes no request of its own. Recommended: call
 * it once at bootstrap. Without one, Vanguard still PUTs its logs itself, which is deprecated and will be removed in the
 * next major version (VAN-64). The latest registration is active.
 *
 * Returns its teardown: it removes this registration only, so the newest live one before it becomes active again.
 * Teardowns are idempotent and safe out of order (disposing an older one leaves a newer one active; a disposed one never
 * comes back). `null` removes every registration (back to the deprecated built-in request); teardowns of the removed ones then do nothing,
 * and its own teardown is a no-op.
 */
export const setVanguardErrorLogger = (logger: VanguardErrorLogger | null): (() => void) => {
  if (logger === null) {
    registrations = [];
    return () => {};
  }
  const registration = { logger };
  registrations = [...registrations, registration];
  return () => {
    registrations = registrations.filter((r) => r !== registration);
  };
};

const reportLoggerFailure = (reason: unknown): void => {
  console.error('Vanguard error logger failed', reason);
};

/**
 * Hands one entry to the registered logger, now. Never throws and never rejects: a failing logger can't break the
 * ErrorModal or the error boundary showing the error. Resolves to what the logger returned (`{}` without one, or when
 * it failed).
 */
export const logVanguardError = (type: string, entry: VanguardErrorLogEntry): Promise<unknown> => {
  const logger = activeLogger();
  if (!logger) return Promise.resolve({});
  try {
    return Promise.resolve(logger(type, entry)).then(
      (result) => result ?? {},
      (reason) => {
        reportLoggerFailure(reason);
        return {};
      },
    );
  } catch (reason) {
    reportLoggerFailure(reason);
    return Promise.resolve({});
  }
};
