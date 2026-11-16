/**
 * MUI contract (characterization) stories for AppBar, run in a real browser.
 *
 * Our AppBar.scss is empty, so every computed style here comes from MUI's default theme
 * (no ThemeProvider in Storybook): position, z-index, palette colors, elevation shadow.
 * These lock the visual defaults consumers get today, so a bump that changes them
 * (e.g. v6 CSS-variable based AppBar colors, theme defaults) goes red.
 */
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, within } from 'storybook/test';

import { AppBar } from './AppBar';

type Story = StoryObj<typeof AppBar>;

const MUI_PRIMARY_MAIN = 'rgb(25, 118, 210)';
const WHITE = 'rgb(255, 255, 255)';

const getHeader = (canvasElement: HTMLElement) => within(canvasElement).getByRole('banner');

export const DefaultFixedPrimary: Story = {
  render: () => (
    <AppBar>
      <div style={{ height: 40 }}>{'Fixed bar'}</div>
    </AppBar>
  ),
  play: async ({ canvasElement }) => {
    const header = getHeader(canvasElement);
    const style = getComputedStyle(header);
    await expect(style.position).toBe('fixed');
    await expect(style.top).toBe('0px');
    await expect(style.right).toBe('0px');
    await expect(style.zIndex).toBe('1100');
    await expect(style.display).toBe('flex');
    await expect(style.flexDirection).toBe('column');
    await expect(style.boxSizing).toBe('border-box');
    await expect(style.backgroundColor).toBe(MUI_PRIMARY_MAIN);
    await expect(style.color).toBe(WHITE);
    await expect(style.borderTopLeftRadius).toBe('0px');
    // elevation 4 shadow
    await expect(style.boxShadow).not.toBe('none');
    await expect(header.getBoundingClientRect().width).toBeCloseTo(document.documentElement.clientWidth, 0);
  },
};

export const Positions: Story = {
  render: () => (
    <div style={{ position: 'relative', height: 400 }}>
      {(['static', 'relative', 'sticky', 'absolute'] as const).map((position) => (
        <AppBar key={position} position={position} data-testid={`bar-${position}`}>
          <div>{position}</div>
        </AppBar>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(getComputedStyle(canvas.getByTestId('bar-static')).position).toBe('static');
    await expect(getComputedStyle(canvas.getByTestId('bar-relative')).position).toBe('relative');
    const sticky = getComputedStyle(canvas.getByTestId('bar-sticky'));
    await expect(sticky.position).toBe('sticky');
    await expect(sticky.top).toBe('0px');
    const absolute = getComputedStyle(canvas.getByTestId('bar-absolute'));
    await expect(absolute.position).toBe('absolute');
    await expect(absolute.right).toBe('0px');
  },
};

export const Colors: Story = {
  render: () => (
    <div style={{ color: 'rgb(10, 20, 30)', backgroundColor: 'rgb(200, 210, 220)' }}>
      {(['primary', 'secondary', 'default', 'inherit', 'transparent'] as const).map((color) => (
        <AppBar key={color} position="static" color={color} data-testid={`bar-${color}`}>
          <div>{color}</div>
        </AppBar>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bg = (c: string) => getComputedStyle(canvas.getByTestId(`bar-${c}`)).backgroundColor;
    const fg = (c: string) => getComputedStyle(canvas.getByTestId(`bar-${c}`)).color;
    await expect(bg('primary')).toBe(MUI_PRIMARY_MAIN);
    await expect(fg('primary')).toBe(WHITE);
    await expect(bg('secondary')).toBe('rgb(156, 39, 176)');
    await expect(fg('secondary')).toBe(WHITE);
    await expect(bg('default')).toBe('rgb(245, 245, 245)');
    await expect(fg('default')).toBe('rgba(0, 0, 0, 0.87)');
    // inherit takes the parent's text color only; background stays the Paper background (white)
    await expect(fg('inherit')).toBe('rgb(10, 20, 30)');
    await expect(bg('inherit')).toBe(WHITE);
    await expect(bg('transparent')).toBe('rgba(0, 0, 0, 0)');
    await expect(fg('transparent')).toBe('rgb(10, 20, 30)');
  },
};

export const Elevation: Story = {
  render: () => (
    <div>
      <AppBar position="static" elevation={0} data-testid="bar-e0">
        <div>{'e0'}</div>
      </AppBar>
      <AppBar position="static" elevation={4} data-testid="bar-e4">
        <div>{'e4'}</div>
      </AppBar>
      <AppBar position="static" elevation={8} data-testid="bar-e8">
        <div>{'e8'}</div>
      </AppBar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shadow = (id: string) => getComputedStyle(canvas.getByTestId(id)).boxShadow;
    await expect(shadow('bar-e0')).toBe('none');
    await expect(shadow('bar-e4')).not.toBe('none');
    await expect(shadow('bar-e8')).not.toBe('none');
    await expect(shadow('bar-e8')).not.toBe(shadow('bar-e4'));
  },
};

export const SquareVsRounded: Story = {
  render: () => (
    <div>
      <AppBar position="static" data-testid="bar-square">
        <div>{'square'}</div>
      </AppBar>
      <AppBar position="static" square={false} data-testid="bar-rounded">
        <div>{'rounded'}</div>
      </AppBar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(getComputedStyle(canvas.getByTestId('bar-square')).borderTopLeftRadius).toBe('0px');
    await expect(getComputedStyle(canvas.getByTestId('bar-rounded')).borderTopLeftRadius).toBe('4px');
  },
};

export default {
  ...SbDecorator({
    title: 'Vanguard/AppBar/MUI Contract',
    component: AppBar,
  }),
};
