import { render } from '@test-utils/test-utils';
import React from 'react';

import { CtaWithIcon } from './CtaWithIcon';

import { describe, test } from 'vitest';
describe('CtaWithIcon component tests', () => {
  test('should render', async () => {
    render(<CtaWithIcon />);
  });
});
