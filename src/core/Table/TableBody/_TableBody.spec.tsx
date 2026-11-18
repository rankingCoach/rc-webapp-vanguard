import { render } from '@test-utils/test-utils';
import React from 'react';

import { TableBody } from './TableBody';

import { describe, test } from 'vitest';
describe('TableBody component tests', () => {
  test('should render', async () => {
    render(<TableBody />);
  });
});
