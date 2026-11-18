import { render } from '@test-utils/test-utils';
import React from 'react';

import { TableBodyRenderer } from './TableBodyRenderer';

import { describe, test } from 'vitest';
describe('TableBodyRenderer component tests', () => {
  test('should render', async () => {
    render(<TableBodyRenderer />);
  });
});
