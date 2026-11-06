/**
 * MUI contract (characterization) stories for AIAssistantPanel, run in a real browser.
 *
 * Locks real Grow / Fade / Collapse transition end states (computed opacity / visibility / height) through
 * the panel's status flows. The panel imports Collapse and Fade through deep paths
 * (`@mui/material/Collapse/Collapse`, `@mui/material/Fade/Fade`), which v7 rejects; after the import fix
 * these stories must still pass unchanged.
 */
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React, { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { AIAssistantStatus } from '../AIAssistant';
import { aiAssistantStore } from '../stories/bootstrap/aiassistant.test.slice';
import { AIAssistantPanel } from './AIAssistantPanel';

type Story = StoryObj<typeof AIAssistantPanel>;

const ID = 'contractPanel';
const STATUSES: AIAssistantStatus[] = ['closed', 'writing', 'open', 'adjust', 'needsCommand'];

const Harness = ({
  initial,
  onKeep,
  onAdjust,
}: {
  initial: AIAssistantStatus;
  onKeep?: () => void;
  onAdjust?: (...args: unknown[]) => void;
}) => {
  const [status, setStatus] = useState<AIAssistantStatus>(initial);
  const [value, setValue] = useState('Generated text');
  return (
    <div style={{ width: 500, paddingBottom: 400 }}>
      <div>
        {STATUSES.map((s) => (
          <button key={s} data-testid={`set-${s}`} onClick={() => setStatus(s)}>
            {s}
          </button>
        ))}
        <span data-testid="current-status">{status}</span>
      </div>
      <div style={{ position: 'relative', height: 40, border: '1px solid var(--n200)' }}>
        {value}
        <AIAssistantPanel
          id={ID}
          value={value}
          setValue={setValue}
          status={status}
          setStatus={setStatus}
          generateCallback={async () => ''}
          onKeepCallback={onKeep}
          onAdjustClick={onAdjust}
        />
      </div>
    </div>
  );
};

const layers = (canvasElement: HTMLElement) => {
  const panel = within(canvasElement).getByTestId(`${ID}_Panel`);
  const grow = panel.firstElementChild as HTMLElement;
  return {
    panel,
    grow,
    writing: grow.children[0].firstElementChild as HTMLElement,
    main: grow.children[1].firstElementChild as HTMLElement,
  };
};

// Under a loaded full-suite run Grow (350ms) / Fade / Collapse can take longer than waitFor's 1s default.
const SETTLE = { timeout: 5000 };

const expectHidden = async (el: HTMLElement) => {
  await waitFor(() => {
    const s = getComputedStyle(el);
    expect(s.visibility).toBe('hidden');
    expect(s.opacity).toBe('0');
  }, SETTLE);
};
const expectShown = async (el: HTMLElement) => {
  await waitFor(() => {
    const s = getComputedStyle(el);
    expect(s.visibility).toBe('visible');
    expect(s.opacity).toBe('1');
  }, SETTLE);
};
/** The two command textareas (needsCommand first, adjust second), by their placeholder. */
const commandTextareas = (canvasElement: HTMLElement) =>
  within(canvasElement)
    .getAllByPlaceholderText('Write commands to the Assistant')
    .filter((el) => el.tagName === 'TEXTAREA' && !el.hasAttribute('aria-hidden'));

export const GrowOpenClose: Story = {
  render: () => <Harness initial="closed" onKeep={fn()} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { grow, main, writing, panel } = layers(canvasElement);

    await expect(getComputedStyle(panel).position).toBe('absolute');
    await expect(getComputedStyle(panel).zIndex).toBe('1100');
    await expectHidden(grow);

    await userEvent.click(canvas.getByTestId('set-open'));
    await expectShown(grow);
    // fully grown (not scaled down) once the enter transition settles
    await waitFor(() => expect(getComputedStyle(grow).transform).toBe('none'), SETTLE);
    await expectShown(main);
    await expectHidden(writing);
    await expect(canvas.getByRole('button', { name: /keep/i })).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: /keep/i }));
    await expect(canvas.getByTestId('current-status')).toHaveTextContent('closed');
    await expectHidden(grow);
    // Nothing unmounts on exit
    await expect(canvas.getByText('Assistant')).toBeInTheDocument();
  },
};

export const WritingFade: Story = {
  render: () => <Harness initial="writing" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { writing, main } = layers(canvasElement);
    await expectShown(writing);
    await expectHidden(main);
    await expect(canvas.getByText('Stop')).toBeVisible();

    await userEvent.click(canvas.getByTestId('set-open'));
    await expectHidden(writing);
    await expectShown(main);
  },
};

export const AdjustCollapseAndToneGrow: Story = {
  render: () => <Harness initial="open" onAdjust={fn()} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { main } = layers(canvasElement);

    // "adjust" also matches the harness status button; use the panel's own "Adjust" button
    await userEvent.click(within(main).getByRole('button', { name: 'Adjust' }));
    await expect(canvas.getByTestId('current-status')).toHaveTextContent('adjust');
    // open -> adjust: Keep row unmounts, adjust section expands, command section stays collapsed
    await waitFor(() => expect(within(main).queryByRole('button', { name: /keep/i })).toBeNull(), SETTLE);
    const [needsCommand, adjust] = commandTextareas(canvasElement);
    await waitFor(() => expect(adjust).toBeVisible(), SETTLE);
    const shorten = canvas.getByText('Shorten').closest('button') as HTMLElement;
    await waitFor(() => expect(shorten).toBeVisible(), SETTLE);
    // the expanded section is laid out: the option below the textarea has real height
    await expect(shorten.getBoundingClientRect().height).toBeGreaterThan(20);
    await expect(shorten.getBoundingClientRect().top).toBeGreaterThan(adjust.getBoundingClientRect().top);
    await expect(needsCommand).not.toBeVisible();

    const dropdown = canvas.getByText('Formal').closest('button')!.parentElement as HTMLElement;
    await expectHidden(dropdown);
    await userEvent.hover(canvas.getByText('Change tone'));
    await expectShown(dropdown);
    await userEvent.hover(canvas.getByText('Shorten'));
    await expectHidden(dropdown);
  },
};

export const EscapeCloses: Story = {
  render: () => <Harness initial="needsCommand" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { grow, main } = layers(canvasElement);
    await expectShown(main);
    const [needsCommand] = commandTextareas(canvasElement);
    await waitFor(() => expect(needsCommand).toBeVisible(), SETTLE);
    // needsCommand textarea is autofocused
    await waitFor(() => expect(needsCommand).toHaveFocus(), SETTLE);

    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByTestId('current-status')).toHaveTextContent('closed');
    await expectHidden(grow);
  },
};

export default {
  ...SbDecorator({
    title: 'Vanguard/AIAssistantPanel/MUI Contract',
    component: AIAssistantPanel,
    // Textarea (InputBase) needs a redux store, same as the existing AIAssistant stories.
    opts: { customStore: aiAssistantStore },
  }),
};
