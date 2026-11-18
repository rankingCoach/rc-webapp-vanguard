import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { DragAndDropFile } from './DragAndDropFile';

const slot = (container: HTMLElement, name: string) => container.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('DragAndDropFile data-slot contract', () => {
  it('slots the existing elements', () => {
    const { container } = render(<DragAndDropFile onFileDrop={() => {}} />);
    expect(slot(container, 'drag-and-drop-file').tagName).toBe('DIV');
    expect(slot(container, 'drag-and-drop-file-label').tagName).toBe('LABEL');
    expect(slot(container, 'drag-and-drop-file-input').tagName).toBe('INPUT');
  });
});
