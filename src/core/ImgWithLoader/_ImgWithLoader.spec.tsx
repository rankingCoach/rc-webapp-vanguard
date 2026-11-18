import { render } from '@test-utils/test-utils';
import React from 'react';

import { ImgWithLoader } from './ImgWithLoader';

import { describe, test } from 'vitest';
describe('ImgWithLoader component tests', () => {
  test('should render', async () => {
    render(<ImgWithLoader />);
  });
});
