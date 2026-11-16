/**
 * MUI contract (characterization) tests for Vanguard Collapse (263 transitive importers).
 *
 * Vanguard exposes only isOpen / orientation / className / children; everything else is MUI default
 * (collapsedSize 0, no unmountOnExit, appear=false).
 * No Vanguard production code depends on MUI Collapse classes (grep src for "MuiCollapse": none), so the
 * state is asserted as visibility here; real geometry and timing are asserted in _CollapseMuiContract.stories.tsx.
 */
import '@testing-library/jest-dom/vitest';

import React, { createRef } from 'react';
import { describe, expect, test } from 'vitest';

import { render, screen, waitFor } from '../../../../test-utils/test-utils';
import { Collapse } from './Collapse';

const CONTENT = 'Collapsible content';

const renderCollapse = (props: Partial<React.ComponentProps<typeof Collapse>> = {}) => {
  const utils = render(
    <Collapse isOpen={false} {...props}>
      <span>{CONTENT}</span>
    </Collapse>,
  );
  const rerenderWith = (next: Partial<React.ComponentProps<typeof Collapse>>) =>
    utils.rerender(
      <Collapse isOpen={false} {...props} {...next}>
        <span>{CONTENT}</span>
      </Collapse>,
    );
  return { ...utils, rerenderWith };
};

const getContent = () => screen.getByText(CONTENT);

describe('Collapse MUI contract: props', () => {
  test('className is forwarded to the outermost element, which contains the children', () => {
    const { container } = renderCollapse({ className: 'custom-collapse', isOpen: true });
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass('custom-collapse');
    expect(root).toContainElement(getContent());
  });

  test('[v5-quirk] ref is not forwarded (Vanguard Props have no ref)', () => {
    // Baseline characterization: not a promised contract.
    const ref = createRef<HTMLDivElement>();
    render(
      // @ts-expect-error ref is not part of the public props
      <Collapse isOpen={true} ref={ref}>
        <span>{CONTENT}</span>
      </Collapse>,
    );
    expect(ref.current).toBeNull();
  });
});

describe.each([['vertical'], ['horizontal']] as const)('Collapse MUI contract: %s open / closed', (orientation) => {
  test('isOpen=false on mount: children mounted but not visible', () => {
    renderCollapse({ isOpen: false, orientation });
    expect(getContent()).toBeInTheDocument();
    expect(getContent()).not.toBeVisible();
  });

  test('isOpen=true on mount: children visible immediately (no appear transition)', () => {
    renderCollapse({ isOpen: true, orientation });
    expect(getContent()).toBeVisible();
  });

  test('opening makes the children visible', async () => {
    const { rerenderWith } = renderCollapse({ isOpen: false, orientation });
    rerenderWith({ isOpen: true });
    await waitFor(() => expect(getContent()).toBeVisible());
  });

  test('closing hides the children but keeps them mounted', async () => {
    const { rerenderWith } = renderCollapse({ isOpen: true, orientation });
    rerenderWith({ isOpen: false });
    await waitFor(() => expect(getContent()).not.toBeVisible());
    expect(getContent()).toBeInTheDocument();
  });
});
