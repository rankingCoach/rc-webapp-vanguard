import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { TextIcon } from './TextIcon';
import { IconNames } from '@vanguard/Icon/IconNames';

describe('TextIcon data-slot contract', () => {
  it('slots the styled container and renders all story prop combinations', () => {
    const { container, rerender } = render(<TextIcon icon={IconNames.add}>TEST</TextIcon>);
    const root = () => container.querySelector('[data-slot="text-icon"]');
    expect(root()?.tagName).toBe('DIV');
    expect(root()?.textContent).toContain('TEST');
    rerender(<TextIcon icon={IconNames.add} />);
    expect(root()?.tagName).toBe('DIV');
    rerender(<TextIcon iconColor={'--e500'} icon={IconNames.add} />);
    expect(root()?.tagName).toBe('DIV');
  });
});
