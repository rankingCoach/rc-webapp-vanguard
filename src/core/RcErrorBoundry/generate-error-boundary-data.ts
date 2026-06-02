import { EnhancedStore } from '@reduxjs/toolkit';
import { logStore as swaggerLogStore } from '@stores/swagger/LogStore';
import { ErrorInfo } from 'react';

export const generateErrorBoundaryData = (
  key: string,
  error?: Error,
  errorInfo?: ErrorInfo | any,
  store?: EnhancedStore,
  source?: string,
) => {
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

  return swaggerLogStore.putLog(
    {
      data: [
        {
          info: errorInfo,
          error: error?.name,
          message: error?.message?.slice(0, 100),
          href: window.location.href,
          host: window.location.host,
          pathname: window.location.pathname,
          state: store ? reduceStoreSize(store) : undefined,
          source: source,
        } as any,
      ],
    },
    {
      type: key,
    },
  );
};
