import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { ToggleButton } from '@vanguard/ToggleButton/ToggleButton';
import React, { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ToggleButtonGroup } from './ToggleButtonGroup';

/**
 * MUI contract (real browser) for ToggleButtonGroup over MUI v5. Pins the layout MUI's grouped/position
 * classes produce around Vanguard's wrapper divs, and keyboard toggling in a real browser.
 * v9 removes `groupedHorizontal/Vertical`; the joined-corner geometry below must survive the bump.
 */
export default {
  ...SbDecorator({
    title: 'Vanguard/ToggleButtonGroup/MUI Contract',
    component: ToggleButtonGroup,
  }),
};

type Story = StoryObj<typeof ToggleButtonGroup>;

const radii = (el: HTMLElement) => {
  const s = getComputedStyle(el);
  return {
    tl: s.borderTopLeftRadius,
    tr: s.borderTopRightRadius,
    bl: s.borderBottomLeftRadius,
    br: s.borderBottomRightRadius,
  };
};

const ThreeButtons = (props: React.ComponentProps<typeof ToggleButtonGroup>) => (
  <ToggleButtonGroup {...props}>
    <ToggleButton value="left">{'Left'}</ToggleButton>
    <ToggleButton value="center">{'Center'}</ToggleButton>
    <ToggleButton value="right">{'Right'}</ToggleButton>
  </ToggleButtonGroup>
);

export const HorizontalJoinedRow: Story = {
  render: () => <ThreeButtons value="left" exclusive aria-label="horizontal" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'horizontal' });
    const [first, middle, last] = canvas.getAllByRole('button');

    await expect(getComputedStyle(group).display).toBe('inline-flex');
    await expect(getComputedStyle(group).flexDirection).toBe('row');

    // Side by side on one row, touching (MUI pulls non-first buttons left by the 1px border)
    const r1 = first.getBoundingClientRect();
    const r2 = middle.getBoundingClientRect();
    const r3 = last.getBoundingClientRect();
    await expect(Math.round(r1.top)).toBe(Math.round(r2.top));
    await expect(Math.round(r2.top)).toBe(Math.round(r3.top));
    await expect(Math.round(r2.left)).toBe(Math.round(r1.right) - 1);
    await expect(Math.round(r3.left)).toBe(Math.round(r2.right) - 1);

    // Joined corners: outer corners rounded, inner corners square
    await expect(radii(first)).toEqual({ tl: '4px', tr: '0px', bl: '4px', br: '0px' });
    await expect(radii(middle)).toEqual({ tl: '0px', tr: '0px', bl: '0px', br: '0px' });
    await expect(radii(last)).toEqual({ tl: '0px', tr: '4px', bl: '0px', br: '4px' });
  },
};

export const VerticalJoinedColumn: Story = {
  render: () => <ThreeButtons value="left" exclusive orientation="vertical" aria-label="vertical" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'vertical' });
    const [first, middle, last] = canvas.getAllByRole('button');

    await expect(getComputedStyle(group).flexDirection).toBe('column');

    const r1 = first.getBoundingClientRect();
    const r2 = middle.getBoundingClientRect();
    const r3 = last.getBoundingClientRect();
    await expect(Math.round(r1.left)).toBe(Math.round(r2.left));
    await expect(Math.round(r2.top)).toBe(Math.round(r1.bottom) - 1);
    await expect(Math.round(r3.top)).toBe(Math.round(r2.bottom) - 1);

    await expect(radii(first)).toEqual({ tl: '4px', tr: '4px', bl: '0px', br: '0px' });
    await expect(radii(middle)).toEqual({ tl: '0px', tr: '0px', bl: '0px', br: '0px' });
    await expect(radii(last)).toEqual({ tl: '0px', tr: '0px', bl: '4px', br: '4px' });
  },
};

const ButtonsFromOneComponent = () => (
  <>
    <ToggleButton value="left">{'Left'}</ToggleButton>
    <ToggleButton value="center">{'Center'}</ToggleButton>
    <ToggleButton value="right">{'Right'}</ToggleButton>
  </>
);

export const ButtonsFromOneChildComponentAreNotJoined: Story = {
  name: '[v5-quirk] buttons rendered by one child component are not joined',
  render: () => (
    <ToggleButtonGroup value="left" exclusive aria-label="one-child">
      <ButtonsFromOneComponent />
    </ToggleButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    // Baseline characterization: not a promised contract.
    // MUI positions buttons by counting DIRECT children; one child component -> no first/middle/last styling, so
    // every button keeps all four corners rounded.
    const [first, middle, last] = within(canvasElement).getAllByRole('button');
    for (const button of [first, middle, last]) {
      await expect(radii(button)).toEqual({ tl: '4px', tr: '4px', bl: '4px', br: '4px' });
    }
  },
};

export const SelectedAndDisabledPaint: Story = {
  render: () => (
    <ToggleButtonGroup value="left" exclusive>
      <ToggleButton value="left">{'Left'}</ToggleButton>
      <ToggleButton value="right" disabled>
        {'Right'}
      </ToggleButton>
    </ToggleButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selected = canvas.getByRole('button', { name: 'Left' });
    const disabled = canvas.getByRole('button', { name: 'Right' });

    // MUI v5 standard colour: selected gets an 8% black overlay; disabled is click-through
    await expect(getComputedStyle(selected).backgroundColor).toBe('rgba(0, 0, 0, 0.08)');
    await expect(getComputedStyle(disabled).pointerEvents).toBe('none');
  },
};

const onChangeSpy = fn();

export const KeyboardTogglesInRealBrowser: Story = {
  render: () => {
    const Controlled = () => {
      const [value, setValue] = useState<string | null>('left');
      return (
        <ThreeButtons
          value={value}
          exclusive
          onChange={(event, v) => {
            onChangeSpy(event.type, v);
            setValue(v);
          }}
        />
      );
    };
    return <Controlled />;
  },
  play: async ({ canvasElement }) => {
    onChangeSpy.mockClear();
    const canvas = within(canvasElement);

    canvas.getByRole('button', { name: 'Left' }).focus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Center' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('button', { name: 'Center' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('button', { name: 'Center' })).toHaveAttribute('aria-pressed', 'false');

    await expect(onChangeSpy.mock.calls).toEqual([
      ['click', 'center'],
      ['click', null],
    ]);
  },
};
