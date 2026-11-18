import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { GallerySummary } from './GallerySummary';

const slot = (container: HTMLElement, name: string) => container.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('GallerySummary data-slot contract', () => {
  it('slots the existing elements', () => {
    const { container } = render(<GallerySummary mediaItems={Array.from({ length: 4 }, () => ({ objectType: 'MediaItemFile' as const, publicUrl: 'image.png' }))} />);
    expect(slot(container, 'gallery-summary').tagName).toBe('DIV');
    expect(slot(container, 'gallery-summary-item').tagName).toBe('DIV');
    expect(slot(container, 'gallery-summary-image').tagName).toBe('DIV');
    expect(slot(container, 'gallery-summary-more').tagName).toBe('DIV');
  });
});
