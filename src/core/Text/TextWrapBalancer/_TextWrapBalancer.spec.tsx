import { render } from '@test-utils/test-utils';
import React from 'react';

import { TextWrapBalancer } from './TextWrapBalancer';

import { describe, test } from 'vitest';
describe('TextWrapBalancer component tests', () => {
  test('should render', async () => {
    render(<TextWrapBalancer balanced={false}>TEST</TextWrapBalancer>);
  });
});
