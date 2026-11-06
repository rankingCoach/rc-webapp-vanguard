/**
 * MUI contract (characterization) tests for Vanguard Accordion.
 *
 * Locks CURRENT behaviour on @mui/material 5.16.x so the MUI v6 -> v9 bumps go red where MUI changed
 * something Vanguard or its users can observe:
 *  - v6:   AccordionSummary wrapped in <h3> (a heading role appears)            -> [v5-quirk] heading test.
 *  - v9:   TransitionProps removed from the public type (-> slotProps.transition) -> [bug-lock] TransitionProps test.
 *
 * MUI class names are used ONLY where Vanguard production SCSS depends on them:
 *   .MuiAccordion-root            src/core/Accordion/Accordion.scss:1
 *   .MuiAccordionSummary-root     src/core/Accordion/Accordion.scss:16
 *   .MuiAccordionSummary-content  src/core/Accordion/Accordion.scss:24
 *   .MuiAccordionDetails-root     src/core/Accordion/Accordion.scss:30
 * Everything else is asserted through roles, aria-* and visibility. Computed geometry (gutters, elevation,
 * outlined border, icon rotation) is asserted in _AccordionMuiContract.stories.tsx.
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import React, { createRef } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { render, screen, waitFor } from '../../../test-utils/test-utils';
import { IconNames } from '../Icon/IconNames';
import { Accordion, AccordionProps } from './Accordion';

const SUMMARY = 'Summary title';
const DETAILS = 'Details body';
const ACCORDION_ID = 'acc-1';

const renderAccordion = (props: Partial<AccordionProps> = {}) =>
  render(
    <Accordion
      accordionId={ACCORDION_ID}
      summaryChildren={<span>{SUMMARY}</span>}
      detailsChildren={<p>{DETAILS}</p>}
      {...props}
    />,
  );

const getSummary = () => screen.getByRole('button', { name: SUMMARY });
const getDetails = () => screen.getByText(DETAILS);
// Accordion.scss:1 styles `.MuiAccordion-root.Accordion-container`.
const getRoot = (container: HTMLElement) => container.querySelector('.MuiAccordion-root') as HTMLElement;

describe('Accordion MUI contract: structure and roles', () => {
  test('summary is exposed as a button named by the summary children', () => {
    renderAccordion();
    expect(getSummary()).toBeInTheDocument();
  });

  test('summary button carries .MuiAccordionSummary-root (Accordion.scss:16 targets it)', () => {
    renderAccordion();
    expect(getSummary()).toHaveClass('MuiAccordionSummary-root');
  });

  test('[v5-quirk] summary is not exposed as a heading (v6 wraps it in an <h3>)', () => {
    // Baseline characterization: not a promised contract.
    renderAccordion();
    expect(screen.queryByRole('heading')).toBeNull();
  });

  test('summary children sit in .MuiAccordionSummary-content inside the summary (Accordion.scss:24 targets it)', () => {
    const { container } = renderAccordion();
    const content = container.querySelector('.MuiAccordionSummary-content') as HTMLElement;
    expect(content).not.toBeNull();
    expect(getSummary()).toContainElement(content);
    expect(content).toHaveTextContent(SUMMARY);
  });

  test('root carries .MuiAccordion-root + Vanguard Accordion-container (Accordion.scss:1)', () => {
    const { container } = renderAccordion();
    const root = getRoot(container);
    expect(root).toHaveClass('Accordion-container', 'MuiAccordion-root');
    expect(root).not.toHaveClass('Accordion-reverse');
  });

  test('details are exposed inside a region', () => {
    renderAccordion();
    expect(screen.getByRole('region', { hidden: true })).toContainElement(getDetails());
  });

  test('details are rendered in .MuiAccordionDetails-root (Accordion.scss:30 targets it)', () => {
    const { container } = renderAccordion();
    const details = container.querySelector('.MuiAccordionDetails-root') as HTMLElement;
    expect(details).toContainElement(getDetails());
  });

  test('[bug-lock] summary and region both get id=accordionId; aria-controls points at the summary itself', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): summary and region share the same id (duplicate id in the DOM),
    // so aria-controls on the summary resolves to the summary itself, not the region.
    const { container } = renderAccordion();
    const summary = getSummary();
    expect(summary).toHaveAttribute('id', ACCORDION_ID);
    expect(summary).toHaveAttribute('aria-controls', ACCORDION_ID);
    const region = screen.getByRole('region', { hidden: true });
    expect(region).toHaveAttribute('id', ACCORDION_ID);
    expect(region).toHaveAttribute('aria-labelledby', ACCORDION_ID);
    expect(container.querySelectorAll(`[id="${ACCORDION_ID}"]`)).toHaveLength(2);
  });

  test('expand icon (Vanguard Icon, class Accordion-icon) renders inside the summary button', async () => {
    renderAccordion({ iconName: IconNames.add });
    // Icon loads its SVG asynchronously (useDynamicImport) and renders null until then.
    await waitFor(() => expect(getSummary().querySelector('.Accordion-icon')).not.toBeNull());
  });

  test('without summaryChildren the summary gets AccordionSummary-hide and no expand icon', () => {
    const { container } = render(<Accordion accordionId={ACCORDION_ID} detailsChildren={<p>{DETAILS}</p>} />);
    const summary = container.querySelector('.MuiAccordionSummary-root') as HTMLElement;
    expect(summary).toHaveClass('AccordionSummary-hide');
    expect(summary.querySelector('.Accordion-icon')).toBeNull();
  });

  test('reverse adds Accordion-reverse to the root', () => {
    const { container } = renderAccordion({ reverse: true });
    expect(getRoot(container)).toHaveClass('Accordion-reverse');
  });

  test('custom style objects land on root, summary and details', () => {
    const { container } = renderAccordion({
      baseCustomStyle: { marginTop: '11px' },
      summaryCustomStyle: { marginTop: '12px' },
      detailsCustomStyle: { marginTop: '13px' },
    });
    expect(getRoot(container).style.marginTop).toBe('11px');
    expect(getSummary().style.marginTop).toBe('12px');
    expect(getDetails().closest('[style*="margin-top: 13px"]')).not.toBeNull();
  });
});

describe('Accordion MUI contract: expand / collapse', () => {
  test('starts collapsed: aria-expanded=false, details mounted but not visible', () => {
    renderAccordion();
    expect(getSummary()).toHaveAttribute('aria-expanded', 'false');
    // No unmountOnExit: details are in the DOM while collapsed.
    expect(getDetails()).toBeInTheDocument();
    expect(getDetails()).not.toBeVisible();
  });

  test('click expands: aria-expanded=true and details become visible', async () => {
    const user = userEvent.setup();
    renderAccordion();
    await user.click(getSummary());
    expect(getSummary()).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(getDetails()).toBeVisible());
  });

  test('second click collapses again; details stay mounted but hidden', async () => {
    const user = userEvent.setup();
    renderAccordion();
    await user.click(getSummary());
    await user.click(getSummary());
    expect(getSummary()).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(getDetails()).not.toBeVisible());
    expect(getDetails()).toBeInTheDocument();
  });

  test('onExpandedChange receives the new boolean on each toggle', async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    renderAccordion({ onExpandedChange });
    await user.click(getSummary());
    await user.click(getSummary());
    expect(onExpandedChange).toHaveBeenNthCalledWith(1, true);
    expect(onExpandedChange).toHaveBeenNthCalledWith(2, false);
    expect(onExpandedChange).toHaveBeenCalledTimes(2);
  });

  test('Enter on the focused summary toggles once', async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    renderAccordion({ onExpandedChange });
    getSummary().focus();
    await user.keyboard('{Enter}');
    expect(getSummary()).toHaveAttribute('aria-expanded', 'true');
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(onExpandedChange).toHaveBeenLastCalledWith(true);
  });

  test('Space on the focused summary toggles once', async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    renderAccordion({ onExpandedChange });
    getSummary().focus();
    await user.keyboard(' ');
    expect(getSummary()).toHaveAttribute('aria-expanded', 'true');
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
  });

  test('summary is reachable with Tab', async () => {
    const user = userEvent.setup();
    renderAccordion();
    await user.tab();
    expect(getSummary()).toHaveFocus();
  });
});

describe('Accordion MUI contract: controlled expanded', () => {
  test('expanded=true renders open on mount', () => {
    renderAccordion({ expanded: true });
    expect(getSummary()).toHaveAttribute('aria-expanded', 'true');
    expect(getDetails()).toBeVisible();
  });

  test('changing the expanded prop drives the state both ways', async () => {
    const { rerender } = renderAccordion({ expanded: false });
    expect(getSummary()).toHaveAttribute('aria-expanded', 'false');
    rerender(
      <Accordion
        accordionId={ACCORDION_ID}
        summaryChildren={<span>{SUMMARY}</span>}
        detailsChildren={<p>{DETAILS}</p>}
        expanded={true}
      />,
    );
    expect(getSummary()).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(getDetails()).toBeVisible());
    rerender(
      <Accordion
        accordionId={ACCORDION_ID}
        summaryChildren={<span>{SUMMARY}</span>}
        detailsChildren={<p>{DETAILS}</p>}
        expanded={false}
      />,
    );
    expect(getSummary()).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(getDetails()).not.toBeVisible());
  });

  test('[bug-lock] click still toggles while expanded prop is fixed (internal state wins)', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): `expanded` is only an initial/sync value, not a true controlled prop.
    // Clicking collapses even though the parent still passes expanded={true}.
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    renderAccordion({ expanded: true, onExpandedChange });
    await user.click(getSummary());
    expect(getSummary()).toHaveAttribute('aria-expanded', 'false');
    expect(onExpandedChange).toHaveBeenCalledWith(false);
  });
});

describe('Accordion MUI contract: MUI props in the public type that are NOT forwarded', () => {
  test('[bug-lock] MUI onChange is never called', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): onChange is in AccordionProps (from MUI) but Accordion.tsx drops it.
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderAccordion({ onChange });
    await user.click(getSummary());
    expect(onChange).not.toHaveBeenCalled();
  });

  test('[bug-lock] disabled does not disable the summary', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): disabled is in the public type but not forwarded to MUI.
    const user = userEvent.setup();
    renderAccordion({ disabled: true });
    expect(getSummary()).not.toHaveAttribute('aria-disabled');
    await user.click(getSummary());
    expect(getSummary()).toHaveAttribute('aria-expanded', 'true');
  });

  test('[bug-lock] TransitionProps.unmountOnExit is ignored: details stay mounted while collapsed', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): TransitionProps is dropped by Accordion.tsx.
    // NOTE: MUI v9 removes TransitionProps from AccordionProps, so this line becomes a type error at S5.
    renderAccordion({ TransitionProps: { unmountOnExit: true } });
    expect(getDetails()).toBeInTheDocument();
  });

  test('[bug-lock] className and defaultExpanded are ignored', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): className / defaultExpanded are in the type but not forwarded.
    const { container } = renderAccordion({ className: 'my-custom-class', defaultExpanded: true });
    expect(container.querySelector('.my-custom-class')).toBeNull();
    expect(getSummary()).toHaveAttribute('aria-expanded', 'false');
  });

  test('[v5-quirk] ref is not attached to any element', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR: Accordion is a plain function component and does not forward ref.
    const ref = createRef<HTMLDivElement>();
    renderAccordion({ ref } as Partial<AccordionProps>);
    expect(ref.current).toBeNull();
  });
});
