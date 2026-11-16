/**
 * MUI contract (characterization) stories for Toolbar, run in a real browser.
 *
 * Our Toolbar.scss is empty, so the computed layout comes from MUI's default theme:
 * `theme.mixins.toolbar` min-heights (56 / 48 landscape / 64 at sm+), dense 48px, gutters 16px / 24px at sm+.
 * Expected values follow the same media queries MUI uses, evaluated against the current viewport.
 */
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, within } from 'storybook/test';

import { Toolbar } from './Toolbar';

type Story = StoryObj<typeof Toolbar>;

const isSmUp = () => window.matchMedia('(min-width:600px)').matches;
const isLandscape = () => window.matchMedia('(min-width:0px) and (orientation: landscape)').matches;
const expectedRegularMinHeight = () => (isSmUp() ? '64px' : isLandscape() ? '48px' : '56px');
const expectedGutter = () => (isSmUp() ? '24px' : '16px');

export const RegularAndDense: Story = {
  render: () => (
    <div>
      <Toolbar data-testid="tb-regular">
        <span>{'Regular'}</span>
      </Toolbar>
      <Toolbar data-testid="tb-dense" variant="dense">
        <span>{'Dense'}</span>
      </Toolbar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const regular = getComputedStyle(canvas.getByTestId('tb-regular'));
    await expect(regular.display).toBe('flex');
    await expect(regular.alignItems).toBe('center');
    await expect(regular.position).toBe('relative');
    await expect(regular.minHeight).toBe(expectedRegularMinHeight());
    await expect(regular.paddingLeft).toBe(expectedGutter());
    await expect(regular.paddingRight).toBe(expectedGutter());
    await expect(canvas.getByTestId('tb-regular').getBoundingClientRect().height).toBeCloseTo(
      parseFloat(expectedRegularMinHeight()),
      0,
    );

    const dense = getComputedStyle(canvas.getByTestId('tb-dense'));
    await expect(dense.minHeight).toBe('48px');
    await expect(canvas.getByTestId('tb-dense').getBoundingClientRect().height).toBeCloseTo(48, 0);
  },
};

export const DisableGutters: Story = {
  render: () => (
    <Toolbar data-testid="tb" disableGutters={true}>
      <span>{'No gutters'}</span>
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const style = getComputedStyle(within(canvasElement).getByTestId('tb'));
    await expect(style.paddingLeft).toBe('0px');
    await expect(style.paddingRight).toBe('0px');
  },
};

export const ContainerWrapper: Story = {
  render: () => (
    <Toolbar data-testid="tb">
      <span>{'Wrapped'}</span>
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const tb = within(canvasElement).getByTestId('tb');
    // Vanguard wraps MUI Toolbar in div.Toolbar-container (plain block, no styles)
    await expect(tb.parentElement).toHaveClass('Toolbar-container');
    await expect(getComputedStyle(tb.parentElement!).display).toBe('block');
  },
};

export default {
  ...SbDecorator({
    title: 'Vanguard/Toolbar/MUI Contract',
    component: Toolbar,
  }),
};
