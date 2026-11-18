import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { TreeView } from './TreeView';
import { TreeItem } from './TreeItem';

describe('TreeView data-slot contract', () => {
  it('slots the consumer tree and item parts and tracks selected/disabled classes', () => {
    const tree = (selected: string | null, disabled: boolean, expanded: string[]) => (
      <TreeView className={'mine'} selected={selected} expanded={expanded}>
        <TreeItem nodeId={'root'} label={'Root'} className={'item-mine'} disabled={disabled}>
          <TreeItem nodeId={'child'} label={'Child'} />
        </TreeItem>
      </TreeView>
    );
    const { container, rerender } = render(tree(null, false, []));
    expect(container.querySelector('[data-slot="tree-view"]')?.classList.contains('mine')).toBe(true);
    expect(container.querySelector('[data-slot="tree-view"]')?.tagName).toBe('UL');
    for (const [slot, tag] of [['tree-item', 'LI'], ['tree-item-content', 'DIV'], ['tree-item-icon', 'SPAN'], ['tree-item-label', 'DIV']] ) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe(tag);
    }
    const item = container.querySelector('[data-slot="tree-item"]')!;
    expect(item.classList.contains('item-mine')).toBe(true);
    expect(item.hasAttribute('data-selected')).toBe(false);
    expect(item.hasAttribute('data-disabled')).toBe(false);
    rerender(tree('root', true, ['root']));
    expect(item.getAttribute('data-selected')).toBe('');
    expect(item.getAttribute('data-disabled')).toBe('');
    expect(container.querySelector('[data-slot="tree-item-group"]')?.tagName).toBe('UL');
    rerender(tree(null, false, []));
    expect(item.hasAttribute('data-selected')).toBe(false);
    expect(item.hasAttribute('data-disabled')).toBe(false);
  });
});
