import { render } from '@test-utils/test-utils';
import React from 'react';

import { TablePlaceholder } from './TablePlaceholder';

import { describe, test } from 'vitest';
describe('TablePlaceholder component tests', () => {
  test('should render', async () => {
    render(<TablePlaceholder />);
  });
});
