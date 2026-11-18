import { render } from '@test-utils/test-utils';
import React from 'react';

import { TableHeader } from './TableHeader';

import { describe, test } from 'vitest';
describe('TableHeader component tests', () => {
  test('should render', async () => {
    render(<TableHeader />);
  });
});
