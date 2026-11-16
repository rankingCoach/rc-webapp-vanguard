import userEvent from '@testing-library/user-event';
import { ToggleButton } from '@vanguard/ToggleButton/ToggleButton';
import { ToggleButtonGroup } from '@vanguard/ToggleButtonGroup/ToggleButtonGroup';
import React, { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../test-utils/test-utils';

const LintControlled147 = () => {
        const [value, setValue] = useState<string | null>('left');
        return (
          <ToggleButtonGroup value={value} exclusive onChange={(_, v) => setValue(v)}>
            <Buttons />
          </ToggleButtonGroup>
        );
      };


/**
 * MUI contract for ToggleButtonGroup (wraps MUI v5 `ToggleButtonGroup`). Vanguard ToggleButtons wrap the MUI
 * button in a container div, so the group must reach them through MUI's context (not cloneElement).
 * Layout/computed styles are pinned in `_ToggleButtonGroupMuiContract.stories.tsx`.
 */

const Buttons = () => (
  <>
    <ToggleButton value="left">{'Left'}</ToggleButton>
    <ToggleButton value="center">{'Center'}</ToggleButton>
    <ToggleButton value="right">{'Right'}</ToggleButton>
  </>
);

const pressedNames = () =>
  screen
    .getAllByRole('button')
    .filter((b) => b.getAttribute('aria-pressed') === 'true')
    .map((b) => b.textContent);

describe('ToggleButtonGroup (MUI ToggleButtonGroup contract)', () => {
  describe('render', () => {
    it('renders role=group inside the Vanguard container', () => {
      const { container } = render(
        <ToggleButtonGroup value="left" aria-label="alignment">
          <Buttons />
        </ToggleButtonGroup>,
      );

      const group = screen.getByRole('group', { name: 'alignment' });
      const wrapper = container.querySelector('.ToggleButtonGroup-container');
      expect(wrapper?.firstElementChild).toBe(group);
    });

    it('marks buttons matching value as pressed through context', () => {
      render(
        <ToggleButtonGroup value="center">
          <Buttons />
        </ToggleButtonGroup>,
      );

      expect(pressedNames()).toEqual(['Center']);
    });

    it('marks every button in an array value as pressed', () => {
      render(
        <ToggleButtonGroup value={['left', 'right']}>
          <Buttons />
        </ToggleButtonGroup>,
      );

      expect(pressedNames()).toEqual(['Left', 'Right']);
    });

    it('forwards className, data-* props and ref to the MUI root', () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <ToggleButtonGroup value="left" className="consumer" data-testid="tbg" ref={ref}>
          <Buttons />
        </ToggleButtonGroup>,
      );

      const group = screen.getByTestId('tbg');
      expect(group.getAttribute('role')).toBe('group');
      expect(group.classList.contains('consumer')).toBe(true);
      expect(ref.current).toBe(group);
    });

    it('vertical orientation stacks the buttons (flex column); horizontal is a row', () => {
      render(
        <>
          <ToggleButtonGroup value="left" orientation="vertical" aria-label="v">
            <Buttons />
          </ToggleButtonGroup>
          <ToggleButtonGroup value="left" aria-label="h">
            <Buttons />
          </ToggleButtonGroup>
        </>,
      );

      expect(getComputedStyle(screen.getByRole('group', { name: 'v' })).flexDirection).toBe('column');
      expect(getComputedStyle(screen.getByRole('group', { name: 'h' })).flexDirection).not.toBe('column');
    });

    // Joined corners (MUI grouped / first / middle / last classes, no Vanguard dependency) are pinned as geometry in
    // _ToggleButtonGroupMuiContract.stories.tsx, including the single-child-component case.

    it('passes size, color and fullWidth from the group to every button', () => {
      render(
        <ToggleButtonGroup value="left" size="small" color="primary" fullWidth>
          <Buttons />
        </ToggleButtonGroup>,
      );

      expect(getComputedStyle(screen.getByRole('group')).width).toBe('100%');
      screen.getAllByRole('button').forEach((button) => {
        const style = getComputedStyle(button);
        expect(style.padding).toBe('7px');
        expect(style.width).toBe('100%');
      });
      // color="primary" paints the selected button in the primary colour
      expect(getComputedStyle(screen.getByRole('button', { name: 'Left' })).color).toBe('rgb(25, 118, 210)');
    });
  });

  describe('exclusive', () => {
    it('onChange receives (MouseEvent, clicked value)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ToggleButtonGroup value="left" exclusive onChange={onChange}>
          <Buttons />
        </ToggleButtonGroup>,
      );

      await user.click(screen.getByRole('button', { name: 'Right' }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].type).toBe('click');
      expect(onChange.mock.calls[0][1]).toBe('right');
    });

    it('onChange receives null when the selected button is clicked again', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ToggleButtonGroup value="left" exclusive onChange={onChange}>
          <Buttons />
        </ToggleButtonGroup>,
      );

      await user.click(screen.getByRole('button', { name: 'Left' }));

      expect(onChange.mock.calls[0][1]).toBeNull();
    });

    it('controlled: selection follows the value the consumer stores', async () => {
      const user = userEvent.setup();
      const Controlled = LintControlled147;
      render(<Controlled />);

      await user.click(screen.getByRole('button', { name: 'Center' }));
      expect(pressedNames()).toEqual(['Center']);

      await user.click(screen.getByRole('button', { name: 'Center' }));
      expect(pressedNames()).toEqual([]);
    });

    it('without onChange, clicking does not change selection or throw', async () => {
      const user = userEvent.setup();
      render(
        <ToggleButtonGroup value="left" exclusive>
          <Buttons />
        </ToggleButtonGroup>,
      );

      await user.click(screen.getByRole('button', { name: 'Right' }));

      expect(pressedNames()).toEqual(['Left']);
    });
  });

  describe('multiple (exclusive=false)', () => {
    it('onChange appends the clicked value to the array', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ToggleButtonGroup value={['left']} onChange={onChange}>
          <Buttons />
        </ToggleButtonGroup>,
      );

      await user.click(screen.getByRole('button', { name: 'Right' }));

      expect(onChange.mock.calls[0][1]).toEqual(['left', 'right']);
    });

    it('onChange removes an already selected value (empty array, not null)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ToggleButtonGroup value={['left']} onChange={onChange}>
          <Buttons />
        </ToggleButtonGroup>,
      );

      await user.click(screen.getByRole('button', { name: 'Left' }));

      expect(onChange.mock.calls[0][1]).toEqual([]);
    });

    it('onChange starts a new array when value is not an array', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ToggleButtonGroup value={null} onChange={onChange}>
          <Buttons />
        </ToggleButtonGroup>,
      );

      await user.click(screen.getByRole('button', { name: 'Center' }));

      expect(onChange.mock.calls[0][1]).toEqual(['center']);
    });
  });

  describe('keyboard', () => {
    it('Tab moves between buttons and Space/Enter toggle with a click event', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ToggleButtonGroup value="left" exclusive onChange={onChange}>
          <Buttons />
        </ToggleButtonGroup>,
      );

      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Left' }));
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Center' }));

      await user.keyboard(' ');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledTimes(2);
      onChange.mock.calls.forEach(([event, value]) => {
        expect(event.type).toBe('click');
        expect(value).toBe('center');
      });
    });
  });

  describe('disabled', () => {
    it('disables every button and fires no onChange', async () => {
      const user = userEvent.setup({ pointerEventsCheck: 0 });
      const onChange = vi.fn();
      render(
        <ToggleButtonGroup value="left" disabled onChange={onChange}>
          <Buttons />
        </ToggleButtonGroup>,
      );

      const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
      buttons.forEach((button) => {
        expect(button.disabled).toBe(true);
      });
      await user.click(buttons[1]);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('a button-level disabled prop wins over an enabled group', () => {
      render(
        <ToggleButtonGroup value="left">
          <ToggleButton value="left">{'Left'}</ToggleButton>
          <ToggleButton value="right" disabled>
            {'Right'}
          </ToggleButton>
        </ToggleButtonGroup>,
      );

      expect((screen.getByRole('button', { name: 'Left' }) as HTMLButtonElement).disabled).toBe(false);
      expect((screen.getByRole('button', { name: 'Right' }) as HTMLButtonElement).disabled).toBe(true);
    });
  });
});
