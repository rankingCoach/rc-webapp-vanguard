import { EnhancedStore } from '@reduxjs/toolkit';
import { cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach } from 'vitest';

// D15: MUI-ported CSS, kept as the last stylesheet in <head> like the builds append it last to vanguard.css.
import '../styles/mui-compat.scss';

import { PersistGates } from '../components/PersistGates';
import { keepMuiCompatLast } from '../styles/keep-mui-compat-last';
import { storeNonPersist } from './get-storybook-decorator';
import { installPointerCapture } from './pointer-capture';

if (typeof navigator !== 'undefined' && /\bjsdom\b/i.test(navigator.userAgent)) {
  installPointerCapture();
}

keepMuiCompatLast();
afterEach(() => cleanup());
// Plan §36.2 B.3 / §36.5: no global preload of the lazy MUI fallback routes (loading every fallback in every spec
// file's hook made cold full runs slow and flaky). A spec that deliberately renders a MUI route (an unmodelled prop)
// calls preloadMuiFallbacks() in its own beforeAll; the gate allow-lists exactly those files. Any other spec that
// reached a lazy route would render empty and fail — the full run is the reachability audit.

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
