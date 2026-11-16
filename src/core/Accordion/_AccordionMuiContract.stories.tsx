/**
 * MUI contract (characterization) stories for Accordion, run in a real browser.
 *
 * Locks what jsdom cannot see: computed styles our SCSS (Accordion.scss) applies on top of MUI classes,
 * MUI's expanded-state geometry, elevation/outline, real transition end states, and keyboard focus.
 *
 * MUI classes are used only where Accordion.scss depends on them:
 *   .MuiAccordion-root (Accordion.scss:1), .MuiAccordionSummary-root (:16), .MuiAccordionSummary-content (:24),
 *   .MuiAccordionDetails-root (:30).
 * Collapse state is asserted as geometry (root height = summary height [+ details height]) and visibility.
 *
 * Expected to go red at v6.3 (summary becomes a native <button>): UA button styles may leak into the
 * computed summary styles asserted in ScssOnCollapsed (font/border/background).
 */
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Accordion } from './Accordion';

type Story = StoryObj<typeof Accordion>;

const SUMMARY = 'Contract summary';
const DETAILS = 'Contract details';
// MUI Collapse runs a 300ms transition; under a loaded full-suite run the end state can take longer than waitFor's 1s default.
const TRANSITION_WAIT = { timeout: 5000 };

const Harness = (props: Partial<React.ComponentProps<typeof Accordion>>) => (
  <div style={{ width: 400 }}>
    <Accordion
      accordionId="contract-acc"
      summaryChildren={<div style={{ height: 24 }}>{SUMMARY}</div>}
      detailsChildren={<div style={{ height: 80 }}>{DETAILS}</div>}
      {...props}
    />
  </div>
);

const parts = (canvasElement: HTMLElement) => {
  const root = canvasElement.querySelector('.MuiAccordion-root') as HTMLElement;
  return {
    root,
    summary: root.querySelector('.MuiAccordionSummary-root') as HTMLElement,
    content: root.querySelector('.MuiAccordionSummary-content') as HTMLElement,
    details: root.querySelector('.MuiAccordionDetails-root') as HTMLElement,
  };
};

const DETAILS_HEIGHT = 80;
const heightOf = (el: HTMLElement) => el.getBoundingClientRect().height;

/**
 * The element MUI rotates for the expand icon. Located through Vanguard's own `.Accordion-icon` class
 * (its parent is the rotated wrapper); the rotation itself is the user-visible outcome.
 */
const waitForIconRotator = async (summary: HTMLElement) =>
  waitFor(() => {
    const icon = summary.querySelector('.Accordion-icon') as HTMLElement;
    expect(icon).not.toBeNull();
    return icon.parentElement as HTMLElement;
  }, TRANSITION_WAIT);

/** Resolve a CSS custom property to a computed color via a probe element. */
const resolveColorVar = (host: HTMLElement, cssVar: string) => {
  const probe = document.createElement('span');
  probe.style.backgroundColor = `var(${cssVar})`;
  host.appendChild(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
};

export const ScssOnCollapsed: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const { root, summary, content, details } = parts(canvasElement);

    // Root: our SCSS (.MuiAccordion-root.Accordion-container)
    const rootStyle = getComputedStyle(root);
    await expect(rootStyle.display).toBe('flex');
    await expect(rootStyle.flexDirection).toBe('column');
    await expect(rootStyle.zIndex).toBe('3');
    await expect(rootStyle.borderTopWidth).toBe('0px');
    // ::before divider line uses var(--fn-bg)
    await expect(getComputedStyle(root, '::before').backgroundColor).toBe(resolveColorVar(root, '--fn-bg'));

    // Summary: our SCSS removes MUI padding and left-aligns content; MUI keeps min-height 48px.
    const summaryStyle = getComputedStyle(summary);
    await expect(summaryStyle.justifyContent).toBe('flex-start');
    await expect(summaryStyle.paddingLeft).toBe('0px');
    await expect(summaryStyle.paddingRight).toBe('0px');
    await expect(summaryStyle.minHeight).toBe('48px');
    await expect(summaryStyle.display).toBe('flex');
    await expect(summaryStyle.cursor).toBe('pointer');

    // Summary content: our SCSS; MUI content gutters margin 12px 0 collapsed.
    const contentStyle = getComputedStyle(content);
    await expect(contentStyle.alignItems).toBe('flex-start');
    await expect(contentStyle.flexGrow).toBe('0');
    await expect(contentStyle.marginTop).toBe('12px');
    await expect(contentStyle.marginBottom).toBe('12px');

    // Details: our SCSS removes MUI padding.
    await expect(getComputedStyle(details).paddingTop).toBe('0px');
    await expect(getComputedStyle(details).paddingLeft).toBe('0px');

    // Collapsed end state: root is exactly as tall as the summary, details not visible
    await expect(heightOf(root)).toBeCloseTo(heightOf(summary), 0);
    await expect(within(canvasElement).getByText(DETAILS)).not.toBeVisible();
  },
};

export const ExpandCollapseEndStates: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { root, summary, content } = parts(canvasElement);
    const rotator = await waitForIconRotator(summary);

    await userEvent.click(canvas.getByRole('button', { name: SUMMARY }));
    await waitFor(() => expect(heightOf(root)).toBeCloseTo(heightOf(summary) + DETAILS_HEIGHT, 0), TRANSITION_WAIT);
    await expect(canvas.getByText(DETAILS)).toBeVisible();

    // MUI expanded geometry with gutters: summary 64px, content margin 20px 0, icon rotated 180deg.
    await expect(getComputedStyle(summary).minHeight).toBe('64px');
    await expect(getComputedStyle(content).marginTop).toBe('20px');
    await waitFor(() => expect(getComputedStyle(rotator).transform).toBe('matrix(-1, 0, 0, -1, 0, 0)'), TRANSITION_WAIT);

    await userEvent.click(canvas.getByRole('button', { name: SUMMARY }));
    await waitFor(() => expect(heightOf(root)).toBeCloseTo(heightOf(summary), 0), TRANSITION_WAIT);
    await waitFor(() => expect(canvas.getByText(DETAILS)).not.toBeVisible(), TRANSITION_WAIT);
    await expect(getComputedStyle(summary).minHeight).toBe('48px');
    // collapsed icon: rotate(0deg) -> identity matrix
    await waitFor(() => expect(getComputedStyle(rotator).transform).toBe('matrix(1, 0, 0, 1, 0, 0)'), TRANSITION_WAIT);
  },
};

export const ExpandedWithoutGutters: Story = {
  render: () => <Harness disableGutters={true} expanded={true} />,
  play: async ({ canvasElement }) => {
    const { summary, content } = parts(canvasElement);
    await expect(getComputedStyle(summary).minHeight).toBe('48px');
    await expect(getComputedStyle(content).marginTop).toBe('12px');
  },
};

export const ReverseOrder: Story = {
  render: () => <Harness reverse={true} expanded={true} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { root, summary } = parts(canvasElement);
    await expect(getComputedStyle(root).flexDirection).toBe('column-reverse');
    await waitFor(() => expect(canvas.getByText(DETAILS)).toBeVisible(), TRANSITION_WAIT);
    // Visually: details above summary
    await expect(canvas.getByText(DETAILS).getBoundingClientRect().bottom).toBeLessThanOrEqual(
      summary.getBoundingClientRect().top + 1,
    );
  },
};

export const HiddenSummary: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <Accordion accordionId="hidden-acc" detailsChildren={<div>{DETAILS}</div>} expanded={true} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const { summary } = parts(canvasElement);
    await expect(getComputedStyle(summary).display).toBe('none');
    await expect(summary.querySelector('.Accordion-icon')).toBeNull();
    await expect(within(canvasElement).getByText(DETAILS)).toBeVisible();
  },
};

export const IconMargin: Story = {
  name: '[bug-lock] SCSS icon margin never applies',
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): SCSS `.MuiAccordion-root.Accordion { &-icon {...} }` compiles to
    // `.MuiAccordion-root.Accordion-icon`, which matches no element, so the intended 5px margin never applies.
    const { summary } = parts(canvasElement);
    const rotator = await waitForIconRotator(summary);
    const icon = rotator.querySelector('.Accordion-icon') as HTMLElement;
    await expect(getComputedStyle(icon).marginLeft).toBe('0px');
  },
};

export const KeyboardToggle: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summary = canvas.getByRole('button', { name: SUMMARY });
    const unfocusedBackground = getComputedStyle(summary).backgroundColor;

    await userEvent.tab();
    await expect(summary).toHaveFocus();
    // Keyboard focus is visibly indicated (MUI focus-visible background).
    await waitFor(() => expect(getComputedStyle(summary).backgroundColor).not.toBe(unfocusedBackground), TRANSITION_WAIT);

    await userEvent.keyboard('{Enter}');
    await expect(summary).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(canvas.getByText(DETAILS)).toBeVisible(), TRANSITION_WAIT);

    await userEvent.keyboard(' ');
    await expect(summary).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(canvas.getByText(DETAILS)).not.toBeVisible(), TRANSITION_WAIT);
  },
};

export const ElevationVsOutlined: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <div data-testid="elevation">
        <Accordion accordionId="e" summaryChildren={<div>{'Elevation'}</div>} detailsChildren={<div>{'x'}</div>} />
      </div>
      <div data-testid="outlined">
        <Accordion
          accordionId="o"
          variant="outlined"
          summaryChildren={<div>{'Outlined'}</div>}
          detailsChildren={<div>{'y'}</div>}
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rootIn = (id: string) => canvas.getByTestId(id).querySelector('.MuiAccordion-root') as HTMLElement;
    // Default (elevation 1) casts a shadow
    await expect(getComputedStyle(rootIn('elevation')).boxShadow).not.toBe('none');
    // Outlined: no shadow; Accordion.scss:3 `border: 0` also removes MUI's outline border
    await expect(getComputedStyle(rootIn('outlined')).boxShadow).toBe('none');
    await expect(getComputedStyle(rootIn('outlined')).borderTopWidth).toBe('0px');
  },
};

export default {
  ...SbDecorator({
    title: 'Vanguard/Accordion/MUI Contract',
    component: Accordion,
  }),
};
