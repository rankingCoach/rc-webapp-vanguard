import { EnhancedStore } from '@reduxjs/toolkit';
import { cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeAll } from 'vitest';

// D15: MUI-ported CSS, kept as the last stylesheet in <head> like the builds append it last to vanguard.css.
import '../styles/mui-compat.scss';

import { PersistGates } from '../components/PersistGates';
import { preloadMuiFallbacks } from '../core/_internal/lazy-fallback';
import { keepMuiCompatLast } from '../styles/keep-mui-compat-last';
import { storeNonPersist } from './get-storybook-decorator';
import { installPointerCapture } from './pointer-capture';

if (typeof navigator !== 'undefined' && /\bjsdom\b/i.test(navigator.userAgent)) {
  installPointerCapture();
}

keepMuiCompatLast();
afterEach(() => cleanup());
// Plan §36.2 B.3: MUI fallback routes sit behind lazy boundaries; load them up front so specs render them
// synchronously (same DOM as before the split).
beforeAll(() => (process.env.VG_NO_FALLBACK_PRELOAD ? undefined : preloadMuiFallbacks()));

// Global test wrapper component (framework-agnostic)
export const GlobalTestWrapper = ({
  children,
  customStore,
}: {
  children: React.ReactNode;
  customStore?: EnhancedStore;
}) => (
  <PersistGates customStore={customStore || storeNonPersist} shouldPersist={false}>
    {children}
  </PersistGates>
);

// Global test wrapper factory function
export const createGlobalTestWrapper = (customStore?: EnhancedStore) => {
  return ({ children }: { children: React.ReactNode }) => (
    <PersistGates customStore={customStore || storeNonPersist} shouldPersist={false}>
      {children}
    </PersistGates>
  );
};
