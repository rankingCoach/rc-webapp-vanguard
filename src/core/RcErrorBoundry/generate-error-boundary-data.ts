import { LogsResponseSchema } from '@models/swagger/LogsResponseSchema';
import { EnhancedStore } from '@reduxjs/toolkit';
import { logStore as swaggerLogStore } from '@stores/swagger/LogStore';
import { ErrorInfo } from 'react';
import { from, Observable } from 'rxjs';

import { hasVanguardErrorLogger, logVanguardError, VanguardErrorLogEntry } from './error-logger';

/**
 * Vanguard PUTs the log itself, as it always did: its own SDK, with its hardcoded empty `apiBase`, so it goes to the
 * page's origin.
 *
 * @deprecated Register a logger with `setVanguardErrorLogger` and send the log with your own SDK. This fallback will be
 * removed in the next major version (VAN-64).
 */
const legacyPutLog = (key: string, entry: VanguardErrorLogEntry): Observable<LogsResponseSchema> =>
  swaggerLogStore.putLog({ data: [entry as any] }, { type: key });

/**
 * Logs an error, at the call (subscribed or not), and returns an Observable of it.
 *
 * With a logger registered (`setVanguardErrorLogger`): the entry goes to it and Vanguard makes no request. The Observable
 * emits what the logger returned once and completes. It never errors: a failing logger is reported to the console only.
 *
 * Without one, as before: Vanguard PUTs it to `/rest_api/v1/log` itself and the Observable is that request's (the
 * response, or an error). Relying on that built-in request is deprecated and will be removed in the next major version:
 * call `setVanguardErrorLogger` once at bootstrap and send the logs with your own SDK (VAN-64). (Not marked `@deprecated`
 * here: whether a logger is registered is only known at runtime, and the call itself stays right with one.)
 */
export const generateErrorBoundaryData = (
  key: string,
  error?: Error,
  errorInfo?: ErrorInfo | any,
  store?: EnhancedStore,
  source?: string,
): Observable<LogsResponseSchema> => {
  const reduceStoreSize = (store: EnhancedStore) => {
    const loggedState = { ...store.getState() };

    // remove Settings property from store
    if (loggedState && loggedState.Settings) {
      delete loggedState.Settings;
    }

    // limit the store so it does not exceed 2000 characters
    let storeCharacterLimit: number = 2000;
    for (const key in loggedState) {
      if (storeCharacterLimit - JSON.stringify(loggedState[key]).length > 0) {
        storeCharacterLimit -= JSON.stringify(loggedState[key]).length;
      } else {
        delete loggedState[key];
      }
    }

    return loggedState;
  };

  const entry: VanguardErrorLogEntry = {
    info: errorInfo,
    error: error?.name,
    message: error?.message?.slice(0, 100),
    href: window.location.href,
    host: window.location.host,
    pathname: window.location.pathname,
    state: store ? reduceStoreSize(store) : undefined,
    source: source,
  };

  if (!hasVanguardErrorLogger()) return legacyPutLog(key, entry);
  return from(logVanguardError(key, entry)) as Observable<LogsResponseSchema>;
};
