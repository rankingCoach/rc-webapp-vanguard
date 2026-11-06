/**
 * MUI contract (characterization) tests for Vanguard Toolbar.
 *
 * Toolbar is a thin pass-through: `<ComponentContainer className="Toolbar-container"><MuiToolbar {...props} /></…>`
 * with public props typed from the deep import `@mui/material/Toolbar/Toolbar` (not allowed from v7).
 * No Vanguard production code depends on MUI Toolbar classes (grep src: none), so none are asserted here.
 * variant / disableGutters outcomes (min-height, gutter padding) are asserted as computed styles in
 * _ToolbarMuiContract.stories.tsx. This spec locks the pass-through contract.
 */
import '@testing-library/jest-dom/vitest';

import React, { createRef } from 'react';
import { describe, expect, test } from 'vitest';

import { render, screen } from '../../../test-utils/test-utils';
import { Toolbar } from './Toolbar';

// Derived from the Vanguard component (not the MUI deep import), so the spec survives the v7 import fix.
type ToolbarProps = React.ComponentProps<typeof Toolbar>;

const renderToolbar = (props: Partial<ToolbarProps> = {}) =>
  render(
    <Toolbar data-testid="tb" {...props}>
      <span>{'Toolbar content'}</span>
    </Toolbar>,
  );

const getToolbar = () => screen.getByTestId('tb');

describe('Toolbar MUI contract', () => {
  test('renders children inside div.Toolbar-container', () => {
    const { container } = renderToolbar();
    const tb = getToolbar();
    expect(tb.parentElement).toHaveClass('Toolbar-container');
    expect(container.firstElementChild).toBe(tb.parentElement);
    expect(tb).toHaveTextContent('Toolbar content');
  });

  test('[v5-quirk] has no implicit role (not role="toolbar")', () => {
    // Baseline characterization: not a promised contract.
    renderToolbar();
    expect(screen.queryByRole('toolbar')).toBeNull();
    expect(getToolbar()).not.toHaveAttribute('role');
  });

  test('className, id, style, role land on the MUI root', () => {
    renderToolbar({ className: 'my-tb', id: 'tb-id', style: { marginTop: 5 }, role: 'toolbar' });
    const tb = getToolbar();
    expect(tb).toHaveClass('my-tb');
    expect(tb).toHaveAttribute('id', 'tb-id');
    expect(tb.style.marginTop).toBe('5px');
    expect(screen.getByRole('toolbar')).toBe(tb);
  });

  test('component="nav" changes the root element', () => {
    renderToolbar({ component: 'nav' } as Partial<ToolbarProps>);
    expect(getToolbar().tagName).toBe('NAV');
    expect(screen.getByRole('navigation')).toBe(getToolbar());
  });

  test('ref (React 19 ref-as-prop) reaches the MUI root', () => {
    const ref = createRef<HTMLDivElement>();
    renderToolbar({ ref });
    expect(ref.current).toBe(getToolbar());
  });
});
