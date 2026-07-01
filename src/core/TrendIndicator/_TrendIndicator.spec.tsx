import React from 'react';
import { describe, expect, test } from 'vitest';

import { render } from '../../../test-utils/test-utils';
import { TrendDelta, TrendIndicator } from './TrendIndicator';
import { getTrend } from './trend';

describe('TrendIndicator component tests', () => {
  test('should render an upward trend', async () => {
    render(<TrendIndicator current={20} previous={15} />);
  });

  test('should render a stable trend when equal', async () => {
    render(<TrendIndicator current={15} previous={15} />);
  });

  test('TrendDelta should render the magnitude of change', async () => {
    const { getByText } = render(<TrendDelta current={20} previous={15} />);
    getByText('5');
  });
});

describe('getTrend', () => {
  test('rising value is up', () => {
    expect(getTrend(20, 15)).toBe('up');
  });
  test('falling value is down', () => {
    expect(getTrend(10, 15)).toBe('down');
  });
  test('equal value is stable', () => {
    expect(getTrend(15, 15)).toBe('stable');
  });
  test('missing previous is stable', () => {
    expect(getTrend(15, undefined)).toBe('stable');
  });
});
