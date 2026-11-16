/**
 * MUI contract (characterization) stories for Collapse, run in a real browser.
 *
 * Locks real transition end states (computed height/width + visibility) for vertical and horizontal
 * orientation, which jsdom cannot measure. 263 modules import Collapse transitively.
 * The root is located through the Vanguard `className` prop, never through MUI classes
 * (grep src for "MuiCollapse": no production dependency).
 */
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React, { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Collapse } from './Collapse';

type Story = StoryObj<typeof Collapse>;

const Harness = ({ orientation }: { orientation?: 'vertical' | 'horizontal' }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)}>{'toggle'}</button>
      <div style={{ display: 'flex' }}>
        <Collapse isOpen={open} orientation={orientation} className="contract-collapse">
          <div data-testid="content" style={{ width: 120, height: 70 }}>
            {'Content'}
          </div>
        </Collapse>
      </div>
    </div>
  );
};

const getRoot = (canvasElement: HTMLElement) => canvasElement.querySelector('.contract-collapse') as HTMLElement;
// Under a loaded full-suite run the 300ms transition can take longer than waitFor's 1s default.
const SETTLE = { timeout: 5000 };

export const VerticalEndStates: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = getRoot(canvasElement);

    await expect(getComputedStyle(root).height).toBe('0px');
    await expect(getComputedStyle(root).visibility).toBe('hidden');
    await expect(getComputedStyle(root).overflow).toBe('hidden');
    await expect(canvas.getByTestId('content')).not.toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'toggle' }));
    await waitFor(() => expect(getComputedStyle(root).height).toBe('70px'), SETTLE);
    await expect(getComputedStyle(root).visibility).toBe('visible');
    // entered end state: overflow released
    await waitFor(() => expect(getComputedStyle(root).overflow).toBe('visible'), SETTLE);
    await expect(canvas.getByTestId('content')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'toggle' }));
    await waitFor(() => expect(getComputedStyle(root).height).toBe('0px'), SETTLE);
    await waitFor(() => expect(getComputedStyle(root).visibility).toBe('hidden'), SETTLE);
    await expect(canvas.getByTestId('content')).not.toBeVisible();
  },
};

export const HorizontalEndStates: Story = {
  render: () => <Harness orientation="horizontal" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = getRoot(canvasElement);

    await expect(getComputedStyle(root).width).toBe('0px');
    await expect(getComputedStyle(root).visibility).toBe('hidden');

    await userEvent.click(canvas.getByRole('button', { name: 'toggle' }));
    await waitFor(() => expect(getComputedStyle(root).width).toBe('120px'), SETTLE);
    await expect(getComputedStyle(root).visibility).toBe('visible');

    await userEvent.click(canvas.getByRole('button', { name: 'toggle' }));
    await waitFor(() => expect(getComputedStyle(root).width).toBe('0px'), SETTLE);
    await waitFor(() => expect(getComputedStyle(root).visibility).toBe('hidden'), SETTLE);
  },
};

export const DefaultTransitionTiming: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = getRoot(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'toggle' }));
    // Default timeout = theme.transitions.duration.standard (300ms); easing = easeInOut
    await waitFor(() => expect(getComputedStyle(root).transitionDuration).toBe('0.3s'), SETTLE);
    await expect(getComputedStyle(root).transitionProperty).toBe('height');
    await expect(getComputedStyle(root).transitionTimingFunction).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    await waitFor(() => expect(getComputedStyle(root).height).toBe('70px'), SETTLE);
  },
};

export default {
  ...SbDecorator({
    title: 'Vanguard/Collapse/MUI Contract',
    component: Collapse,
  }),
};
