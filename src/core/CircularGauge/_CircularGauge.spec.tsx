import React from 'react';
import { describe, test } from 'vitest';

import { render } from '../../../test-utils/test-utils';
import { CircularGauge } from './CircularGauge';

describe('CircularGauge component tests', () => {
  test('should render', async () => {
    render(<CircularGauge value={72} />);
  });

  test('should render centered children', async () => {
    const { getByText } = render(<CircularGauge value={4.6} max={5}>{'4.6'}</CircularGauge>);
    getByText('4.6');
  });

  test('should render a loading placeholder ring', async () => {
    render(<CircularGauge value={0} loading={true} />);
  });
});
