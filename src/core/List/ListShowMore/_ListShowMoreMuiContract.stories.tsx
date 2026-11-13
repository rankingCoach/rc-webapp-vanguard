/**
 * MUI contract (characterization) stories for ListShowMore, run in a real browser.
 *
 * Locks the real MUI Collapse (timeout 1500ms) end states around the overflow items:
 * collapsed = 0px + hidden, expanded = content height + visible, and the Vanguard-chosen 1500ms duration.
 * The Collapse element is located structurally (first child of ListShowMore's own container), not via MUI
 * classes (grep src for "MuiCollapse": no production dependency).
 */
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ListShowMore } from './ListShowMore';

type Story = StoryObj<typeof ListShowMore>;

const items = Array.from({ length: 5 }, (_, i) => ({ content: <span>{`Feature ${i}`}</span>, selected: true }));
const END_STATE_WAIT = { timeout: 5000 };

export const ExpandCollapseEndStates: Story = {
  render: () => (
    <div style={{ width: 300 }} data-testid="host">
      <ListShowMore listElements={items} type="numerical" limit={2} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // host > ListShowMore ComponentContainer > Collapse root (ListShowMore.tsx renders Collapse first)
    const collapse = canvas.getByTestId('host').firstElementChild!.firstElementChild as HTMLElement;

    await expect(getComputedStyle(collapse).height).toBe('0px');
    await expect(getComputedStyle(collapse).visibility).toBe('hidden');
    await expect(canvas.getByText('Feature 4')).not.toBeVisible();

    await userEvent.click(canvas.getByText('Show all features'));
    // ListShowMore.tsx passes timeout={1500}
    await waitFor(() => expect(getComputedStyle(collapse).transitionDuration).toBe('1.5s'), END_STATE_WAIT);
    // expanded end state: the clip is as tall as its content
    await waitFor(
      () => expect(parseFloat(getComputedStyle(collapse).height)).toBeCloseTo(collapse.scrollHeight, 0),
      END_STATE_WAIT,
    );
    await expect(parseFloat(getComputedStyle(collapse).height)).toBeGreaterThan(0);
    await expect(canvas.getByText('Feature 4')).toBeVisible();

    await userEvent.click(canvas.getByText('Show less'));
    await waitFor(() => expect(getComputedStyle(collapse).height).toBe('0px'), END_STATE_WAIT);
    await waitFor(() => expect(canvas.getByText('Feature 4')).not.toBeVisible(), END_STATE_WAIT);
  },
};

export default {
  ...SbDecorator({
    title: 'Vanguard/ListShowMore/MUI Contract',
    component: ListShowMore,
  }),
};
