/**
 * Providers, set up the way a consumer would. The package exports no store or provider of its own for this:
 * Input / Autocomplete / Select call react-redux `useDispatch()` internally, so a react-redux <Provider> with ANY
 * store is required (react-redux 9 throws "could not find react-redux context value" without one). Nothing else
 * (no MUI ThemeProvider, no LocalizationProvider) is needed: those are internal to the bundle.
 */
import { configureStore } from '@reduxjs/toolkit';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';

export const makeStore = () => configureStore({ reducer: { app: (state: Record<string, never> = {}) => state } });

export const renderWithProviders = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  const store = makeStore();
  const Wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
  return render(ui, { wrapper: Wrapper, ...options });
};
