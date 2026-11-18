import { render } from '@test-utils/test-utils';
import React from 'react';

import { FooterPagination } from './FooterPagination';

import { describe, test } from 'vitest';
describe('FooterPagination component tests', () => {
  test('should render', async () => {
    render(<FooterPagination />);
  });
});
