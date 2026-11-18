import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, test } from 'vitest';

import { TextHighlighted } from './TextHighlighted';

describe('TextHighlighted component tests', () => {
  test('should render', async () => {
    render(<TextHighlighted children={undefined} />);
  });
});
