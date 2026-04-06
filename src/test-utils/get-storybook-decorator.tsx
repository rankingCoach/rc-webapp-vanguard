import { combineReducers, configureStore, createSlice, EnhancedStore, PayloadAction } from '@reduxjs/toolkit';
import { Decorator } from '@storybook/react-vite';
import { ModalProvider } from '@vanguard/Modal/ModalContext.tsx';
import { ModalRoot } from '@vanguard/Modal/ModalRoot/ModalRoot.tsx';
import { SnackbarRoot } from '@vanguard/SnackbarRoot/SnackbarRoot.tsx';
import React from 'react';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { PersistGates } from '../components/PersistGates';

export const removeVerifiedDecorator: Decorator = (storyFn, context) => {
  context.kind = context.kind.replace(/\.verified$/, '');
  context.title = context.title.replace(/\.verified$/, '');
  return storyFn(context);
};

export type StorybookDecorator = {
  title: string;
  component: React.ReactNode | any;
  render?: (args: any) => React.ReactNode;
  subcomponents?: Record<string, React.ReactNode>; //ðŸ‘ˆ Adds the ReactNode component as a subcomponent
  extra?: any;
  mocks?: any[];
  opts?: {
    withRedux?: boolean;
    customStore?: EnhancedStore;
    hideAllControls?: boolean;
    maxWidth?: string;
    fullScreen?: boolean;
    shouldPersist?: boolean;
    description?: string;
  };
};

const initialState: { value: number } = {
  value: 0,
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});
const reducer = combineReducers({
  // ...baseReducersConfig,
  counter: counterSlice.reducer,
});

// Action creators are generated for each case reducer function
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

const persistConfig = {
  key: 'SB_PERSIST_KEY',
  storage: storage,
  // whitelist: ["defaultSidebarWidth", "shouldRunCoverage", "version"],
};

export const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(logger),
});
export const storybookMockStore = store;
export const storeNonPersist = configureStore({
  reducer: reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(logger),
});

export const SbDecorator = (sbArgs: StorybookDecorator, a?: any) => {
  const { title, component, render, subcomponents, extra, mocks, opts } = sbArgs;
  const isVitestRun = typeof process !== 'undefined' && process.env.VITEST === 'true';
  if (title.charAt(0) === '.') {
    throw new Error(`${title} is not a valid storybook title`);
  }
  if (opts?.fullScreen) {
    document.documentElement.style.setProperty('--sb-show-main', 'block');
  }

  if (!a) a = {};

  if (opts?.customStore) {
    opts.withRedux = true;
  }

  const renderWithChrome = (Story: any) => (
    <div
      className={'react-container'}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Story />
    </div>
  );

  const toRet = {
    title: title,
    component: component,
    subcomponents: subcomponents,
    ...(render ? { render } : {}),
    ...extra,
    parameters: {
      ...(opts?.description && {
        docs: {
          description: {
            component: opts.description,
          },
        },
      }),
      msw: {
        handlers: mocks,
      },
      mockData: mocks ? [...mocks] : [],
      controls: {
        exclude: opts?.hideAllControls ? /.*/g : undefined,
      },
    },
    decorators: [
      removeVerifiedDecorator,
      opts?.withRedux
        ? (Story: any) => {
            if (isVitestRun) {
              return <Provider store={opts?.customStore ? opts.customStore : store}>{renderWithChrome(Story)}</Provider>;
            }

            return (
              <PersistGates
                customStore={opts?.customStore ? opts.customStore : store}
                shouldPersist={opts?.shouldPersist}
              >
                <ModalProvider>
                  <ModalRoot />
                  <SnackbarRoot />
                  {renderWithChrome(Story)}
                </ModalProvider>
              </PersistGates>
            );
          }
        : (Story: any) => {
            if (isVitestRun) {
              return renderWithChrome(Story);
            }

            return (
              <ModalProvider>
                <ModalRoot />
                <SnackbarRoot />
                {renderWithChrome(Story)}
              </ModalProvider>
            );
          },
      // withMock,
    ],
  };

  return toRet;
};

export const disableControls = (values: string[]) => {
  values = values.filter((x) => !!x);
  const toRet: any = {};
  for (const prop of values) {
    toRet[prop] = {
      table: {
        disable: true,
      },
    };
  }

  return toRet;
};

/**
 * Component: Storybook Jump Page Background
 *
 * - Use as a background when mocking Jump pages (for a background)
 */
export const SbJumpPageBackground = (
  props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
) => {
  const bg =
    'linear-gradient(135deg, #fff 0%, #fffaf7 10%, #fff3ea 20%, #f5f3f0 33%, #ddf3ff 66%, #d0f1c9 100%) center center fixed';
  return (
    <div style={{ width: '100%', background: bg, display: 'flex', justifyContent: 'center', padding: '30px' }}>
      <div style={{ width: '100%' }}>{props.children}</div>
    </div>
  );
};
