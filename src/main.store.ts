import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { GlobalReducer } from './global.slice';

const reducers = combineReducers({
  app: GlobalReducer,
});

const persist = {
  key: 'rankingcoach_persist',
  whitelist: [''],
  storage,
  timeout: 1,
};

export const MiddleWareConfig = (getDefaultMiddleware: any) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      ignoredActionPaths: ['register', 'rehydrate'],
    },
  });

export type RootState = ReturnType<typeof reducers>;
export const Reducer = persistReducer(persist, reducers);
export const MainStore = configureStore({
  reducer: Reducer,
  middleware: MiddleWareConfig,
});
export const MainStorePersistor = persistStore(MainStore);
