import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ImgLoader } from './ImgLoader';

describe('ImgLoader data-slot contract', () => {
  it('slots the layout, container and image', () => {
    const { container } = render(<ImgLoader title={'Title'} description={'Description'} />);
    for (const [slot, tag] of [['img-loader-container', 'DIV'], ['img-loader', 'DIV'], ['img-loader-image', 'IMG']] ) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe(tag);
    }
  });
});
