import { render } from '@test-utils/test-utils';
import React from 'react';

import { Rating } from './Rating';

import { describe, test } from 'vitest';
describe('Rating component tests', () => {
  test('should render', async () => {
    render(<Rating value={4.2} size={32} />);
  });
});
