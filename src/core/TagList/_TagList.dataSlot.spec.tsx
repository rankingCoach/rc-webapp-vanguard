import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { TagList } from './TagList';
import { Tag } from './Tag/Tag';
import { TagType } from './Tag/TagType.enum';

describe('TagList data-slot contract', () => {
  it('slots the list, tag wrapper, styled tag and delete control', () => {
    const { container } = render(<TagList className={'mine'} tags={[{ id: 1, text: 'Tag', hasDeleteBtn: true }]} />);
    expect(container.querySelector('[data-slot="tag-list"]')?.classList.contains('mine')).toBe(true);
    for (const slot of ['tag-container', 'tag', 'tag-delete']) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe('DIV');
    }
    expect(container.querySelector('[data-slot="tag"]')?.classList.contains('tag')).toBe(true);
  });

  it('tracks variant and type', () => {
    const { container, rerender } = render(<TagList tags={[{ text: 'Tag' }]} />);
    expect(container.querySelector('[data-slot="tag-list"]')?.getAttribute('data-variant')).toBe('tag');
    expect(container.querySelector('[data-slot="tag"]')?.getAttribute('data-variant')).toBe('tag');
    expect(container.querySelector('[data-slot="tag"]')?.getAttribute('data-type')).toBe('tag-default');
    rerender(<TagList variant={'chip'} tags={[{ text: 'Tag', type: TagType.primary }]} />);
    expect(container.querySelector('[data-slot="tag-list"]')?.getAttribute('data-variant')).toBe('chip');
    expect(container.querySelector('[data-slot="tag"]')?.getAttribute('data-variant')).toBe('chip');
    expect(container.querySelector('[data-slot="tag"]')?.getAttribute('data-type')).toBe('tag-primary');
    rerender(<Tag text={'Tag'} hasInnerElement innerElement={'Inner'} />);
    expect(container.querySelector('[data-slot="tag-content"]')?.tagName).toBe('DIV');
  });
});
