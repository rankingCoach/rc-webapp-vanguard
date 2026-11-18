import { render } from '@test-utils/test-utils';
import React from 'react';

import { StatusBadge } from './StatusBadge';

import { describe, test } from 'vitest';
describe('StatusBadge component tests', () => {
  test('should render', async () => {
    render(<StatusBadge text={'test'} status={'publishing'} />);
  });
});
