import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ClipboardText } from './ClipboardText';

describe('ClipboardText data-slot contract', () => {
  it('slots the root, copy control and content', () => {
    const { container } = render(<ClipboardText label={'Label'} value={'Value'} />);
    for (const [slot, tag] of [['clipboard-text', 'DIV'], ['clipboard-text-copy', 'DIV'], ['clipboard-text-content', 'DIV']] ) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe(tag);
    }
  });
});
