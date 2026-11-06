/**
 * MUI contract (characterization) tests for Vanguard AppBar.
 *
 * AppBar is a thin pass-through: `<ComponentContainer className="AppBar-container"><MuiAppBar {...props} /></…>`
 * with public props typed from the deep import `@mui/material/AppBar/AppBar` (not allowed from v7).
 * No Vanguard production code depends on MUI AppBar/Paper classes (grep src: none), so no MUI class is asserted
 * here. position / color / elevation / square outcomes are asserted as computed styles in
 * _AppBarMuiContract.stories.tsx. This spec locks the pass-through contract (props, attrs, ref, events).
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import React, { createRef } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { render, screen } from '../../../test-utils/test-utils';
import { AppBar } from './AppBar';

// Derived from the Vanguard component (not the MUI deep import), so the spec survives the v7 import fix.
type AppBarProps = React.ComponentProps<typeof AppBar>;

const renderAppBar = (props: Partial<AppBarProps> = {}) =>
  render(
    <AppBar {...props}>
      <span>{'Title'}</span>
    </AppBar>,
  );

const getHeader = () => screen.getByRole('banner');

describe('AppBar MUI contract: structure', () => {
  test('renders a banner landmark inside div.AppBar-container', () => {
    const { container } = renderAppBar();
    const header = getHeader();
    expect(header.parentElement).toHaveClass('AppBar-container');
    expect(container.firstElementChild).toBe(header.parentElement);
    expect(header).toHaveTextContent('Title');
  });
});

describe('AppBar MUI contract: props reach MUI', () => {
  test('className, id, data-testid, style, aria-label land on the <header>, not the container', () => {
    const { container } = render(
      <AppBar className="my-bar" id="bar-id" data-testid="bar" style={{ marginTop: 7 }} aria-label="Main bar">
        <span>{'x'}</span>
      </AppBar>,
    );
    const header = screen.getByTestId('bar');
    expect(header.tagName).toBe('HEADER');
    expect(header).toHaveClass('my-bar');
    expect(header).toHaveAttribute('id', 'bar-id');
    expect(header).toHaveAttribute('aria-label', 'Main bar');
    expect(header.style.marginTop).toBe('7px');
    expect(container.firstElementChild).not.toHaveClass('my-bar');
  });

  test('component="div" changes the root element (and drops the banner role)', () => {
    const { container } = renderAppBar({ component: 'div' } as Partial<AppBarProps>);
    expect(screen.queryByRole('banner')).toBeNull();
    const root = container.querySelector('.AppBar-container')!.firstElementChild as HTMLElement;
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveTextContent('Title');
  });

  test('event handlers are forwarded', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderAppBar({ onClick });
    await user.click(getHeader());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('ref (React 19 ref-as-prop) reaches the <header>', () => {
    const ref = createRef<HTMLDivElement>();
    renderAppBar({ ref });
    expect(ref.current).toBe(getHeader());
  });

  test('classes.root (public MUI passthrough) lands on the root', () => {
    renderAppBar({ classes: { root: 'custom-root-class' } });
    expect(getHeader()).toHaveClass('custom-root-class');
  });
});
