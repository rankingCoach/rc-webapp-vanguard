import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { expect, test, vi } from 'vitest';

import { Menu } from './Menu';

test('function paper/root slots retain owner state, refs, events and enforced overlay stacking', () => {
  const paperRef = React.createRef<HTMLDivElement>();
  const click = vi.fn();
  const paper = vi.fn(() => ({ ref: paperRef, onClick: click, style: { width: 123 } }));
  render(
    <Menu
      open
      anchorReference="none"
      width={240}
      slotProps={{ paper, root: () => ({ style: { opacity: 0.8, zIndex: 1 } }) }}
      items={[{ children: 'Choice' }]}
    />,
  );
  expect(paper).toHaveBeenCalled();
  expect(paper.mock.calls[0]?.length).toBe(1);
  expect(paperRef.current).toHaveStyle({ width: '123px' });
  fireEvent.click(screen.getByRole('menuitem'));
  expect(click).toHaveBeenCalledTimes(1);
  expect(document.querySelector('.MuiMenu-root')).toHaveStyle({ opacity: '0.8' });
  expect(Number((document.querySelector('.MuiMenu-root') as HTMLElement).style.zIndex)).toBeGreaterThan(1);
});

test('Vanguard sizing continues to replace legacy PaperProps wholesale', () => {
  render(
    <Menu
      open
      anchorReference="none"
      width={240}
      PaperProps={{ title: 'ignored legacy', style: { width: 123 } }}
      items={[{ children: 'Sized' }]}
    />,
  );
  expect(document.querySelector('.MuiMenu-paper')).toHaveStyle({ width: '240px' });
  expect(screen.queryByTitle('ignored legacy')).toBeNull();
});
