import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { SegmentBar } from './SegmentBar';

describe('SegmentBar data-slot contract', () => {
  it('slots the consumer root and every segment in regular and loading renders', () => {
    const segments = [{ value: 11, color: '--s400' }, { value: 2, color: '--w400' }];
    const { container, rerender } = render(<SegmentBar segments={segments} className={'mine'} />);
    const root = () => container.querySelector('[data-slot="segment-bar"]');
    expect(root()?.tagName).toBe('DIV');
    expect(root()?.classList.contains('mine')).toBe(true);
    const parts = root()?.querySelectorAll('[data-slot="segment-bar-segment"]');
    expect(parts?.length).toBe(2);
    for (const part of Array.from(parts ?? [])) expect(part.tagName).toBe('DIV');
    rerender(<SegmentBar segments={segments} loading />);
    expect(root()?.querySelectorAll('[data-slot="segment-bar-segment"]').length).toBe(2);
    rerender(<SegmentBar segments={[]} />);
    expect(root()).toBeNull();
  });
});
