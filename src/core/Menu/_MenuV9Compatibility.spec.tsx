import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';

import { Menu } from './Menu';

const anchors: HTMLElement[] = [];
afterEach(() => anchors.splice(0).forEach((node) => { node.remove(); }));

const anchor = () => {
  const node = document.createElement('button');
  document.body.appendChild(node);
  anchors.push(node);
  node.getBoundingClientRect = () => new DOMRect(10, 10, 80, 32);
  return node;
};

const LegacyRoot = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
  const domProps = { ...props } as React.HTMLAttributes<HTMLDivElement> & { ownerState?: unknown };
  delete domProps.ownerState;
  return <div {...domProps} ref={ref} data-testid="legacy-root" />;
});

const ExplicitRoot = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
  const domProps = { ...props } as React.HTMLAttributes<HTMLDivElement> & { ownerState?: unknown };
  delete domProps.ownerState;
  return <div {...domProps} ref={ref} data-testid="explicit-root" />;
});

test('inherited legacy Menu components.Root and componentsProps.root still reach the root', async () => {
  const trigger = anchor();
  render(
    <Menu
      open
      anchorEl={trigger}
      items={[{ children: 'One' }]}
      components={{ Root: LegacyRoot }}
      componentsProps={{ root: { title: 'legacy root props' }, backdrop: { title: 'legacy backdrop props' } }}
    />,
  );
  expect(screen.getByTestId('legacy-root')).toHaveAttribute('title', 'legacy root props');
  expect(screen.getByTestId('legacy-root').parentElement).toBe(document.body);
  trigger.focus();
  await waitFor(() =>
    expect(screen.getByTestId('legacy-root')).toContainElement(document.activeElement as HTMLElement),
  );
  expect(trigger).not.toHaveFocus();
  expect(getComputedStyle(screen.getByTitle('legacy backdrop props')).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(screen.getByRole('menuitem', { name: 'One' })).toBeInTheDocument();
});

test('explicit root slots and callback slot props override inherited legacy Menu aliases', () => {
  render(
    <Menu
      open
      anchorEl={anchor()}
      items={[{ children: 'One' }]}
      components={{ Root: LegacyRoot }}
      componentsProps={{ root: { title: 'legacy root props' } }}
      slots={{ root: ExplicitRoot }}
      slotProps={{ root: () => ({ title: 'explicit root props' }) }}
    />,
  );
  expect(screen.queryByTestId('legacy-root')).toBeNull();
  expect(screen.getByTestId('explicit-root')).toHaveAttribute('title', 'explicit root props');
});

test('legacy disableEscapeKeyDown prevents the close callback without suppressing Tab close', () => {
  const onClose = vi.fn();
  render(<Menu open anchorEl={anchor()} disableEscapeKeyDown onClose={onClose} items={[{ children: 'One' }]} />);
  const item = screen.getByRole('menuitem', { name: 'One' });
  fireEvent.keyDown(item, { key: 'Escape' });
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.keyDown(item, { key: 'Tab' });
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onClose.mock.calls[0][1]).toBe('tabKeyDown');
});
