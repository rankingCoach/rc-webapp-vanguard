import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ImgWithLoader } from './ImgWithLoader';

describe('ImgWithLoader data-slot contract', () => {
  it('slots both branches, the media information and caller image', () => {
    const { container, rerender } = render(<ImgWithLoader className={'mine'} showMediaType />);
    for (const [slot, tag] of [['img-with-loader', 'DIV'], ['img-with-loader-placeholder', 'DIV'], ['img-with-loader-media-type', 'DIV'], ['img-with-loader-image', 'IMG']] ) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe(tag);
    }
    expect(container.querySelector('[data-slot="img-with-loader-image"]')?.classList.contains('mine')).toBe(true);
    rerender(<ImgWithLoader data-slot={'custom-image'} />);
    expect(container.querySelector('[data-slot="custom-image"]')?.tagName).toBe('IMG');
  });
});
