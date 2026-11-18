import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ListItems } from './ListItems';

const slot = (container: HTMLElement, name: string) => container.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('ListItems data-slot contract', () => {
  it('slots the existing elements', () => {
    const { container } = render(<ListItems className={'mine'} items={[{ id: 'one', left: 'Left', right: 'Right', title: 'Title', content: 'Content', last: 'Last' }]} />);
    expect(slot(container, 'list-items').tagName).toBe('DIV');
    expect(slot(container, 'list-items-list').tagName).toBe('UL');
    expect(slot(container, 'list-items-item').tagName).toBe('LI');
    expect(slot(container, 'list-items-item-left').tagName).toBe('DIV');
    expect(slot(container, 'list-items-item-middle').tagName).toBe('DIV');
    expect(slot(container, 'list-items-item-title').tagName).toBe('DIV');
    expect(slot(container, 'list-items-item-content').tagName).toBe('DIV');
    expect(slot(container, 'list-items-item-last').tagName).toBe('DIV');
    expect(slot(container, 'list-items-item-right').tagName).toBe('DIV');
    expect(slot(container, 'list-items').classList.contains('mine')).toBe(true);
  });
});
