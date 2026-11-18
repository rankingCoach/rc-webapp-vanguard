import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { IconNames } from '@vanguard/Icon/IconNames';
import { IllustrationBlob } from './IllustrationBlob';
import { BlobAnimation } from './BlobAnimation/BlobAnimation';

describe('IllustrationBlob data-slot contract', () => {
  it('slots the illustration layers, images, blobs and icon holders', () => {
    const { container } = render(<IllustrationBlob icon={IconNames.card} />);
    for (const [slot, tag] of [['illustration-blob', 'DIV'], ['illustration-blob-layer', 'DIV'], ['illustration-blob-image', 'DIV'], ['illustration-blob-decoration', 'DIV'], ['illustration-blob-icon', 'DIV'], ['blob-animation', 'DIV']] ) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe(tag);
    }
    expect(container.querySelectorAll('[data-slot="illustration-blob-layer"]')).toHaveLength(2);
  });

  it('slots standalone blob animations', () => {
    const { container } = render(<BlobAnimation />);
    expect(container.querySelector('[data-slot="blob-animation"]')?.tagName).toBe('DIV');
  });
});
