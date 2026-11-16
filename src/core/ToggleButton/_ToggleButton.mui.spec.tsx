import userEvent from '@testing-library/user-event';
import { ToggleButton } from '@vanguard/ToggleButton/ToggleButton';
import React, { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '../../../test-utils/test-utils';

/**
 * MUI contract for ToggleButton (wraps MUI v5 `ToggleButton` / `ButtonBase` in a Vanguard container).
 * Pins the ButtonBase semantics that change in v9 (keyboard activation of non-native elements, handlers on
 * disabled non-native elements). No Vanguard production code depends on MuiToggleButton/TouchRipple classes, so
 * the tests assert role/aria/attributes and computed styles instead.
 */
describe('ToggleButton (MUI ToggleButton/ButtonBase contract)', () => {
  describe('render', () => {
    it('renders a native <button type="button"> with the value attribute and aria-pressed=false', () => {
      render(<ToggleButton value="bold">{'Bold'}</ToggleButton>);

      const button = screen.getByRole('button', { name: 'Bold' });
      expect(button.tagName).toBe('BUTTON');
      expect(button.getAttribute('type')).toBe('button');
      expect(button.getAttribute('value')).toBe('bold');
      expect(button.getAttribute('aria-pressed')).toBe('false');
    });

    it('reflects selected as aria-pressed=true and the selected fill', () => {
      render(
        <>
          <ToggleButton value="bold">{'Off'}</ToggleButton>
          <ToggleButton value="bold" selected>
            {'On'}
          </ToggleButton>
        </>,
      );

      expect(screen.getByRole('button', { name: 'On', pressed: true })).toBeTruthy();
      expect(getComputedStyle(screen.getByRole('button', { name: 'Off' })).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      expect(getComputedStyle(screen.getByRole('button', { name: 'On' })).backgroundColor).toBe('rgba(0, 0, 0, 0.08)');
    });

    it('puts testId on the Vanguard container, not on the button', () => {
      render(
        <ToggleButton value="bold" testId="tb">
          {'Bold'}
        </ToggleButton>,
      );

      const container = screen.getByTestId('tb');
      expect(container.classList.contains('ToggleButton-container')).toBe(true);
      expect(container.firstElementChild).toBe(screen.getByRole('button'));
    });

    it('forwards className and data-* props to the MUI button', () => {
      render(
        <ToggleButton value="bold" className="consumer" data-qa="qa-bold">
          {'Bold'}
        </ToggleButton>,
      );

      const button = screen.getByRole('button');
      expect(button.classList.contains('consumer')).toBe(true);
      expect(button.getAttribute('data-qa')).toBe('qa-bold');
    });

    it('size, color and fullWidth change the painted button (padding, selected colour, width)', () => {
      render(
        <>
          <ToggleButton value="a">{'Medium'}</ToggleButton>
          <ToggleButton value="b" size="small" color="primary" selected fullWidth>
            {'Small'}
          </ToggleButton>
        </>,
      );

      const medium = getComputedStyle(screen.getByRole('button', { name: 'Medium' }));
      const small = getComputedStyle(screen.getByRole('button', { name: 'Small' }));
      expect(medium.padding).toBe('11px');
      expect(small.padding).toBe('7px');
      expect(small.width).toBe('100%');
      expect(medium.width).toBe('');
      expect(small.color).toBe('rgb(25, 118, 210)');
    });

    it('forwards ref to the underlying <button> (React 19 ref-as-prop)', () => {
      const ref = createRef<HTMLButtonElement>();
      render(
        <ToggleButton value="bold" ref={ref}>
          {'Bold'}
        </ToggleButton>,
      );

      expect(ref.current).toBe(screen.getByRole('button'));
    });
  });

  describe('mouse activation', () => {
    it('calls onChange and onClick with (MouseEvent, value) and bubbles the click to ancestors', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onClick = vi.fn();
      const onAncestorClick = vi.fn();
      render(
        <div onClick={onAncestorClick}>
          <ToggleButton value="bold" onChange={onChange} onClick={onClick}>
            {'Bold'}
          </ToggleButton>
        </div>,
      );

      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick.mock.calls[0][1]).toBe('bold');
      expect(onClick.mock.calls[0][0].type).toBe('click');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].type).toBe('click');
      expect(onChange.mock.calls[0][1]).toBe('bold');
      expect(onAncestorClick).toHaveBeenCalledTimes(1);
    });

    it('skips onChange when onClick calls preventDefault', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ToggleButton value="bold" onChange={onChange} onClick={(e) => e.preventDefault()}>
          {'Bold'}
        </ToggleButton>,
      );

      await user.click(screen.getByRole('button'));

      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not toggle selected by itself (selection is controlled by the consumer)', async () => {
      const user = userEvent.setup();
      render(<ToggleButton value="bold">{'Bold'}</ToggleButton>);

      await user.click(screen.getByRole('button'));

      expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('keyboard activation (native <button>)', () => {
    it.each([['{Enter}'], [' ']])('%s fires onChange with a click event that bubbles', async (key) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onAncestorClick = vi.fn();
      render(
        <div onClick={onAncestorClick}>
          <ToggleButton value="bold" onChange={onChange}>
            {'Bold'}
          </ToggleButton>
        </div>,
      );

      screen.getByRole('button').focus();
      await user.keyboard(key);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].type).toBe('click');
      expect(onAncestorClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('keyboard activation (non-native component="div")', () => {
    // MUI v9: ButtonBase dispatches a real click for Enter/Space on non-native elements, so onChange receives a
    // MouseEvent and the click bubbles. In v5 MUI calls the handler directly with the keyboard event.
    it("[v5-quirk] Enter calls onChange with a bubbling click event (v9)", async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onAncestorClick = vi.fn();
      render(
        <div onClick={onAncestorClick}>
          <ToggleButton value="bold" component="div" onChange={onChange}>
            {'Bold'}
          </ToggleButton>
        </div>,
      );

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('DIV');
      expect(button.getAttribute('tabindex')).toBe('0');
      button.focus();
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].type).toBe('click');
      expect(onChange.mock.calls[0][1]).toBe('bold');
      expect(onAncestorClick).toHaveBeenCalledTimes(1);
    });

    it("[v5-quirk] Space calls onChange with a bubbling click event (v9)", async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onAncestorClick = vi.fn();
      render(
        <div onClick={onAncestorClick}>
          <ToggleButton value="bold" component="div" onChange={onChange}>
            {'Bold'}
          </ToggleButton>
        </div>,
      );

      screen.getByRole('button').focus();
      await user.keyboard(' ');

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].type).toBe('click');
      expect(onAncestorClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('disabled', () => {
    it('native button: disabled attribute, tabindex -1, click-through, no onChange on click', () => {
      const onChange = vi.fn();
      render(
        <ToggleButton value="bold" disabled onChange={onChange}>
          {'Bold'}
        </ToggleButton>,
      );

      const button = screen.getByRole('button') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
      expect(button.getAttribute('tabindex')).toBe('-1');
      // MUI sets pointer-events: none on disabled ButtonBase
      expect(getComputedStyle(button).pointerEvents).toBe('none');
      // A dispatched click on a disabled native <button> is dropped by the browser/jsdom
      fireEvent.click(button);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('non-native element: aria-disabled and tabindex -1', () => {
      render(
        <ToggleButton value="bold" component="div" disabled>
          {'Bold'}
        </ToggleButton>,
      );

      const button = screen.getByRole('button');
      expect(button.getAttribute('aria-disabled')).toBe('true');
      expect(button.getAttribute('tabindex')).toBe('-1');
    });

    // S4a accepted the MUI7.3.11 !disabled Space guard (see the prior AST approval).
    // MUI9 useButtonBase suppresses click and keyboard handlers on disabled non-native elements.
    // Restore the original [bug-lock] provenance as well as pinning the approved v9 fix.
    it("[bug-lock] disabled non-native elements ignore click, Enter and Space (v9)", () => {
      // Baseline characterization: not a promised contract.
      const onChange = vi.fn();
      render(
        <ToggleButton value="bold" component="div" disabled onChange={onChange}>
          {'Bold'}
        </ToggleButton>,
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.keyDown(button, { key: 'Enter' });
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.keyDown(button, { key: ' ' });
      fireEvent.keyUp(button, { key: ' ' });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('ripple', () => {
    // Vanguard does not depend on the MUI TouchRipple DOM; only the observable outcome (clicks land) is pinned.
    it('a ripple does not swallow the click', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ToggleButton value="bold" onChange={onChange}>
          {'Bold'}
        </ToggleButton>,
      );

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button'));

      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('disableRipple keeps the button clickable', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ToggleButton value="bold" disableRipple onChange={onChange}>
          {'Bold'}
        </ToggleButton>,
      );

      await user.click(screen.getByRole('button'));

      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });
});
