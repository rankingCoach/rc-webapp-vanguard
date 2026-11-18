import userEvent from '@testing-library/user-event';
import { ToggleButton } from '@vanguard/ToggleButton/ToggleButton';
import { ToggleButtonGroup } from '@vanguard/ToggleButtonGroup/ToggleButtonGroup';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '../../../test-utils/test-utils';

/**
 * Characterization of the arrow-key focus the group shipped with on MUI 9.5 (roving tab index root), pinned before
 * MUI is replaced. Every button stays tabbable (Vanguard passes tabIndex 0); arrows only move focus, never select.
 */
const Group = (props: { orientation?: 'horizontal' | 'vertical'; disabledCenter?: boolean }) => (
  <ToggleButtonGroup value="left" exclusive orientation={props.orientation} aria-label="g">
    <ToggleButton value="left">{'Left'}</ToggleButton>
    <ToggleButton value="center" disabled={props.disabledCenter}>
      {'Center'}
    </ToggleButton>
    <ToggleButton value="right">{'Right'}</ToggleButton>
  </ToggleButtonGroup>
);

const focused = () => (document.activeElement as HTMLElement | null)?.textContent;

describe('ToggleButtonGroup arrow-key focus', () => {
  it('horizontal: ArrowRight/ArrowLeft move focus and wrap', async () => {
    const user = userEvent.setup();
    render(<Group />);
    screen.getByRole('button', { name: 'Left' }).focus();

    await user.keyboard('{ArrowRight}');
    expect(focused()).toBe('Center');
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(focused()).toBe('Left');
    await user.keyboard('{ArrowLeft}');
    expect(focused()).toBe('Right');
  });

  it('Home/End jump to the first/last button', async () => {
    const user = userEvent.setup();
    render(<Group />);
    screen.getByRole('button', { name: 'Center' }).focus();

    await user.keyboard('{End}');
    expect(focused()).toBe('Right');
    await user.keyboard('{Home}');
    expect(focused()).toBe('Left');
  });

  it('skips disabled buttons', async () => {
    const user = userEvent.setup();
    render(<Group disabledCenter />);
    screen.getByRole('button', { name: 'Left' }).focus();

    await user.keyboard('{ArrowRight}');
    expect(focused()).toBe('Right');
  });

  it('vertical: ArrowDown/ArrowUp move focus; ArrowRight does not', async () => {
    const user = userEvent.setup();
    render(<Group orientation="vertical" />);
    screen.getByRole('button', { name: 'Left' }).focus();

    await user.keyboard('{ArrowRight}');
    expect(focused()).toBe('Left');
    await user.keyboard('{ArrowDown}');
    expect(focused()).toBe('Center');
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(focused()).toBe('Right');
  });

  it('arrows never change selection and modifiers are ignored', async () => {
    const user = userEvent.setup();
    render(<Group />);
    screen.getByRole('button', { name: 'Left' }).focus();

    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(focused()).toBe('Left');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Left' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Center' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('every enabled button keeps tabindex 0', () => {
    render(<Group />);
    for (const b of screen.getAllByRole('button')) {
      expect(b.getAttribute('tabindex')).toBe('0');
    }
  });
});
