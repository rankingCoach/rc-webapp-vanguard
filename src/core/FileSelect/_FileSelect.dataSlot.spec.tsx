import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { MediaItemSelectInput } from './MediaItemSelectInput';

const slot = (container: HTMLElement, name: string) => container.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('FileSelect data-slot contract', () => {
  it('slots the existing elements', () => {
    const { container } = render(<MediaItemSelectInput isOpen={false} openCallback={() => {}} onFilesSelected={() => {}} />);
    expect(slot(container, 'media-item-select-input').tagName).toBe('INPUT');
  });
});
