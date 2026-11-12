import { EnhancedStore } from '@reduxjs/toolkit';
import { ErrorInfo } from 'react';
import { from, Observable } from 'rxjs';

import { logVanguardError, VanguardErrorLogEntry } from './error-logger';

/**
 * Logs an error, at the call (subscribed or not), and returns an Observable of it. Vanguard makes no request: the entry
 * goes to the logger registered with `setVanguardErrorLogger`, or to `console.error` when there is none.
 *
 * The Observable emits what the logger returned (or resolved to) once and completes (`{}` without a logger). It never
 * errors: a failing logger is reported to the console only.
 */
export const generateErrorBoundaryData = (
  key: string,
  error?: Error,
  errorInfo?: ErrorInfo | any,
  store?: EnhancedStore,
  source?: string,
): Observable<unknown> => {
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

  return from(logVanguardError(key, entry));
};
