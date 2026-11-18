import { render } from '@test-utils/test-utils';
import React from 'react';

import { TableFooter } from './TableFooter';

import { describe, test } from 'vitest';
describe('TableFooter component tests', () => {
  test('should render', async () => {
    render(<TableFooter />);
  });
});
