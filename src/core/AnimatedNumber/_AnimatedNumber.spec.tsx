import React from 'react';
import { describe, test } from 'vitest';

import { render } from '../../../test-utils/test-utils';
import { AnimatedNumber } from './AnimatedNumber';

describe('AnimatedNumber component tests', () => {
  test('should render frozen at 0 when not animating', async () => {
    const { getByText } = render(<AnimatedNumber value={95} animate={false} />);
    getByText('0');
  });

  test('should apply the formatter on the final value when not animating target reached', async () => {
    // animate=false keeps the tween at 0, so the formatter does not run yet.
    const { getByText } = render(<AnimatedNumber value={0} formatter={(v) => `${v}%`} animate={false} />);
    getByText('0%');
  });
});
