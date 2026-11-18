import { MenuItem as MuiMenuItem, MenuList as MuiMenuList } from '@mui/material';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { MenuList } from './MenuList';
import { MenuOption } from './MenuOption';

/**
 * Differential parity: MUI 9.5 MenuList + MenuItem vs the own MenuList + MenuOption(role="menuitem") on the same key
 * sequences. After each step: the focused item index, every item's tabindex, and the list's role/tabindex.
 */
type Item = { label: string; selected?: boolean; disabled?: boolean };
type Kind = 'mui' | 'own';

const List = ({
  kind,
  items,
  autoFocusItem,
  wrap,
}: {
  kind: Kind;
  items: Item[];
  autoFocusItem: boolean;
  wrap: boolean;
}) => {
  if (kind === 'mui') {
    return (
      <MuiMenuList autoFocusItem={autoFocusItem} disableListWrap={!wrap} data-testid="list">
        {items.map((i) => (
          <MuiMenuItem key={i.label} selected={i.selected} disabled={i.disabled}>
            {i.label}
          </MuiMenuItem>
        ))}
      </MuiMenuList>
    );
  }
  return (
    <MenuList autoFocusItem={autoFocusItem} disableListWrap={!wrap} data-testid="list">
      {items.map((i) => (
        <MenuOption key={i.label} role="menuitem" selected={i.selected} disabled={i.disabled}>
          {i.label}
        </MenuOption>
      ))}
    </MenuList>
  );
};

const state = (container: HTMLElement) => {
  const list = container.querySelector('[data-testid="list"]') as HTMLElement;
  const lis = Array.from(list.children) as HTMLElement[];
  return {
    list: { role: list.getAttribute('role'), tabIndex: list.getAttribute('tabindex') },
    focused: lis.indexOf(document.activeElement as HTMLElement),
    tabIndexes: lis.map((li) => li.getAttribute('tabindex')),
  };
};

const run = (kind: Kind, items: Item[], keys: string[], opts: { autoFocusItem: boolean; wrap: boolean }) => {
  const view = render(<List kind={kind} items={items} {...opts} />);
  const trace = [state(view.container)];
  for (const key of keys) {
    const target = (document.activeElement as HTMLElement) ?? document.body;
    act(() => {
      fireEvent.keyDown(target, { key });
    });
    trace.push(state(view.container));
  }
  view.unmount();
  return trace;
};

const items: Item[] = [
  { label: 'Apple' },
  { label: 'Banana', selected: true },
  { label: 'Blueberry' },
  { label: 'Cherry', disabled: true },
  { label: 'Date' },
];

const cases: [string, Item[], string[], { autoFocusItem: boolean; wrap: boolean }][] = [
  [
    'auto-focus the selected item, arrows and wrap',
    items,
    ['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowUp'],
    { autoFocusItem: true, wrap: true },
  ],
  ['no wrap at the ends', items, ['End', 'ArrowDown', 'Home', 'ArrowUp'], { autoFocusItem: true, wrap: false }],
  ['typeahead', items, ['d', 'b', 'b', 'l', 'a'], { autoFocusItem: true, wrap: true }],
  [
    'no selected item: first item',
    items.map((i) => ({ ...i, selected: false })),
    ['ArrowDown'],
    { autoFocusItem: true, wrap: true },
  ],
  ['no autoFocusItem', items, [], { autoFocusItem: false, wrap: true }],
];

describe('MenuList parity with MUI MenuList + MenuItem', () => {
  it.each(cases)('%s', (_name, list, keys, opts) => {
    expect(run('own', list, keys, opts)).toEqual(run('mui', list, keys, opts));
  });
});

/** Review findings (Codex, handoff 10): each against MUI's own behaviour. */
describe('MenuList parity, review cases', () => {
  const muiOrOwn = (kind: Kind, props: { onKeyDown?: (e: React.KeyboardEvent) => void; items: Item[] }) =>
    kind === 'mui' ? (
      <MuiMenuList autoFocusItem data-testid="list" onKeyDown={props.onKeyDown}>
        {props.items.map((i) => (
          <MuiMenuItem key={i.label} selected={i.selected} disabled={i.disabled}>
            {i.label}
          </MuiMenuItem>
        ))}
      </MuiMenuList>
    ) : (
      <MenuList autoFocusItem data-testid="list" onKeyDown={props.onKeyDown}>
        {props.items.map((i) => (
          <MenuOption key={i.label} role="menuitem" selected={i.selected} disabled={i.disabled}>
            {i.label}
          </MenuOption>
        ))}
      </MenuList>
    );

  it('items that arrive after mount get the initial focus', () => {
    const go = (kind: Kind) => {
      const view = render(muiOrOwn(kind, { items: [] }));
      view.rerender(muiOrOwn(kind, { items: items.map((i) => ({ ...i, selected: false })) }));
      const s = state(view.container);
      view.unmount();
      return s;
    };
    expect(go('own')).toEqual(go('mui'));
  });

  it('focusing an item directly moves the tab stop to it', () => {
    const go = (kind: Kind) => {
      const view = render(muiOrOwn(kind, { items }));
      const lis = Array.from(
        (view.container.querySelector('[data-testid="list"]') as HTMLElement).children,
      ) as HTMLElement[];
      act(() => lis[4].focus());
      const s = state(view.container);
      view.unmount();
      return s;
    };
    expect(go('own')).toEqual(go('mui'));
  });

  it('consumer onKeyDown runs after navigation (sees the new focus and defaultPrevented)', () => {
    const go = (kind: Kind) => {
      const seen: string[] = [];
      const onKeyDown = (e: React.KeyboardEvent) =>
        seen.push(`${(document.activeElement as HTMLElement).textContent}:${e.defaultPrevented}`);
      const view = render(muiOrOwn(kind, { items, onKeyDown }));
      act(() => {
        fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
      });
      view.unmount();
      return seen;
    };
    expect(go('own')).toEqual(go('mui'));
  });

  it('Shift+ArrowDown does not move focus', () => {
    const go = (kind: Kind) => {
      const view = render(muiOrOwn(kind, { items }));
      act(() => {
        fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown', shiftKey: true });
      });
      const s = state(view.container);
      view.unmount();
      return s;
    };
    expect(go('own')).toEqual(go('mui'));
  });

  it('a disabled selected item does not hide a later enabled selected one', () => {
    const list: Item[] = [
      { label: 'Apple' },
      { label: 'Banana', selected: true, disabled: true },
      { label: 'Cherry', selected: true },
    ];
    const go = (kind: Kind) => {
      const view = render(muiOrOwn(kind, { items: list }));
      const s = state(view.container);
      view.unmount();
      return s;
    };
    expect(go('own')).toEqual(go('mui'));
  });
});
