import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { fireEvent } from '@testing-library/react';
import { TogglerWithText } from './TogglerWithText';

describe('TogglerWithText data-slot contract', () => {
  it('slots the consumer root, slider and active options', () => {
    const { container, rerender } = render(<TogglerWithText left={'Left'} right={'Right'} togglerState={'left'} className={'mine'} />);
    for (const [slot, tag] of [['toggler-with-text', 'DIV'], ['toggler-with-text-slider', 'DIV'], ['toggler-with-text-left', 'DIV'], ['toggler-with-text-right', 'DIV']] ) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe(tag);
    }
    const root = container.querySelector('[data-slot="toggler-with-text"]')!;
    const left = container.querySelector('[data-slot="toggler-with-text-left"]')!;
    const right = container.querySelector('[data-slot="toggler-with-text-right"]')!;
    expect(root.classList.contains('mine')).toBe(true);
    expect(root.getAttribute('data-variant')).toBe('default');
    expect(left.getAttribute('data-active')).toBe('');
    expect(right.hasAttribute('data-active')).toBe(false);
    fireEvent.click(right);
    expect(left.hasAttribute('data-active')).toBe(false);
    expect(right.getAttribute('data-active')).toBe('');
    rerender(<TogglerWithText key={'right'} left={'Left'} right={'Right'} togglerState={'right'} theme={'square'} />);
    expect(container.querySelector('[data-slot="toggler-with-text"]')?.getAttribute('data-variant')).toBe('square');
    expect(container.querySelector('[data-slot="toggler-with-text-left"]')?.hasAttribute('data-active')).toBe(false);
    expect(container.querySelector('[data-slot="toggler-with-text-right"]')?.getAttribute('data-active')).toBe('');
  });
});
