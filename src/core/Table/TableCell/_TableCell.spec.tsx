import { render } from '@test-utils/test-utils';
import React from 'react';

import { TableCell } from './TableCell';

import { describe, test } from 'vitest';
describe('TableCell component tests', () => {
  test('should render', async () => {
    render(<TableCell />);
  });
});
