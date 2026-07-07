import { EnhancedStore } from '@reduxjs/toolkit';
import { cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach } from 'vitest';

import { PersistGates } from '../components/PersistGates';
import { storeNonPersist } from './get-storybook-decorator';

afterEach(() => cleanup());

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
