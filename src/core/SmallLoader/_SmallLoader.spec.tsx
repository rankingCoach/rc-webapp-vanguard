import { render } from '@test-utils/test-utils';
import React from 'react';

import { SmallLoader } from './SmallLoader';

import { describe, test } from 'vitest';
describe('SmallLoader component tests', () => {
  test('should render', async () => {
    render(<SmallLoader />);
  });
});
