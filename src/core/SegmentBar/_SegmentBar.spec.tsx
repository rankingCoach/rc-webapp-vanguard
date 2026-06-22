import React from 'react';
import { describe, expect, test } from 'vitest';

import { render } from '../../../test-utils/test-utils';
import { SegmentBar } from './SegmentBar';

const segments = [
  { value: 11, color: '--s400' },
  { value: 2, color: '--w400' },
  { value: 1, color: '--e400' },
];

describe('SegmentBar component tests', () => {
  test('should render one element per segment', async () => {
    const { container } = render(<SegmentBar segments={segments} />);
    expect(container.querySelectorAll('[style*="flex-grow"]').length).toBe(3);
  });

  test('should render nothing when total is zero and not loading', async () => {
    const { container } = render(<SegmentBar segments={[{ value: 0, color: '--n400' }]} />);
    expect(container.querySelectorAll('[style*="flex-grow"]').length).toBe(0);
  });

  test('should render a loading placeholder', async () => {
    const { container } = render(<SegmentBar segments={segments} loading={true} />);
    expect(container.querySelectorAll('[style*="flex-grow"]').length).toBe(3);
  });
});
