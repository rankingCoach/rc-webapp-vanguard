import { render } from '@test-utils/test-utils';
import React from 'react';

import { FooterShowMore } from './FooterShowMore';

import { describe, test } from 'vitest';
describe('FooterShowMore component tests', () => {
  test('should render', async () => {
    render(<FooterShowMore />);
  });
});
