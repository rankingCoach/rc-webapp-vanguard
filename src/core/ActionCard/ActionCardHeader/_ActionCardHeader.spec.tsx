import { render } from '@test-utils/test-utils';
import React from 'react';

import { ActionCardHeader } from './ActionCardHeader';

import { describe, test } from 'vitest';
describe('ActionCardHeader component tests', () => {
  test('should render', async () => {
    render(<ActionCardHeader>Render me</ActionCardHeader>);
  });
});
