import { render } from '@test-utils/test-utils';
import React from 'react';

import { ClipboardText } from './ClipboardText';

import { describe, test } from 'vitest';
describe('ClipboardText component tests', () => {
  test('should render', async () => {
    render(<ClipboardText label={'ds'} value={'sadasdas'} />);
  });
});
