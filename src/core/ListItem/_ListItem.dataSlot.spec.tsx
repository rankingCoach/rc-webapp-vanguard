import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ListItem } from './ListItem';

const slot = (container: HTMLElement, name: string) => container.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('ListItem data-slot contract', () => {
  it('slots the existing elements', () => {
    const { container } = render(<ListItem index={0} type={'alphabetical'} classNameListItem={'mine'} isComingSoon>Item</ListItem>);
    expect(slot(container, 'list-item-container').tagName).toBe('DIV');
    expect(slot(container, 'list-item').tagName).toBe('DIV');
    expect(slot(container, 'list-item-coming-soon').tagName).toBe('DIV');
    expect(slot(container, 'list-item-content').tagName).toBe('DIV');
    expect(slot(container, 'list-item').classList.contains('mine')).toBe(true);
    expect(container.querySelector('[data-testid="iconList"]')?.hasAttribute('data-slot')).toBe(false);
  });
});
