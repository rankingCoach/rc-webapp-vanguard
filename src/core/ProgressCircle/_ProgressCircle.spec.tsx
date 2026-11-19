import { render } from '@test-utils/test-utils';
import { ProgressCircle } from '@vanguard/ProgressCircle/ProgressCircle';
import React from 'react';

import { describe, test } from 'vitest';
describe('ProgressCircle component tests', () => {
  test('should render', async () => {
    render(<ProgressCircle size={80} progress={50} />);
  });
});
