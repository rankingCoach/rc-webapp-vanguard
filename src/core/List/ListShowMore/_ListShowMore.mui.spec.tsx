/**
 * MUI contract (characterization) tests for ListShowMore.
 *
 * ListShowMore renders ONLY the overflow items (index >= limit) inside an MUI Collapse (timeout 1500ms);
 * the first `limit` items are rendered by the parent List. No Vanguard production code depends on MUI
 * Collapse classes (grep src for "MuiCollapse": none), so "expanded" is asserted as item visibility here;
 * real geometry and the 1500ms timing are asserted in _ListShowMoreMuiContract.stories.tsx.
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../test-utils/test-utils';
import { ListElementSchema } from '../List';
import { ListShowMore, ListShowMoreProps } from './ListShowMore';

const SHOW_ALL = 'Show all features';
const SHOW_LESS = 'Show less';
const COLLAPSE_TIMEOUT_WAIT = { timeout: 4000 };

const elements = (n: number): ListElementSchema[] =>
  Array.from({ length: n }, (_, i) => ({ content: <span>{`Item ${i}`}</span>, selected: i % 2 === 0 }));

const renderShowMore = (props: Partial<ListShowMoreProps> = {}) => {
  const utils = render(<ListShowMore listElements={elements(5)} type="numerical" limit={2} {...props} />);
  return utils;
};

describe('ListShowMore MUI contract: rendering', () => {
  test('renders nothing without limit', () => {
    const { container } = render(<ListShowMore listElements={elements(5)} type="numerical" />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders nothing when listElements.length <= limit', () => {
    const { container } = render(<ListShowMore listElements={elements(3)} type="numerical" limit={3} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders only the overflow items, mounted but hidden, with the "Show all features" CTA', () => {
    renderShowMore();
    expect(screen.queryByText('Item 0')).toBeNull();
    expect(screen.queryByText('Item 1')).toBeNull();
    ['Item 2', 'Item 3', 'Item 4'].forEach((t) => {
      expect(screen.getByText(t)).toBeInTheDocument();
      expect(screen.getByText(t)).not.toBeVisible();
    });
    expect(screen.getByText(SHOW_ALL)).toBeInTheDocument();
    expect(screen.queryByText(SHOW_LESS)).toBeNull();
  });

  test('numerical overflow items continue numbering after the limit', () => {
    renderShowMore();
    expect(screen.getByText('3.')).toBeInTheDocument();
    expect(screen.getByText('5.')).toBeInTheDocument();
    expect(screen.queryByText('1.')).toBeNull();
  });
});

describe('ListShowMore MUI contract: expand / collapse', () => {
  test('"Show all features" reveals the overflow items and swaps the CTA to "Show less"', async () => {
    const user = userEvent.setup();
    renderShowMore();
    await user.click(screen.getByText(SHOW_ALL));
    expect(screen.getByText(SHOW_LESS)).toBeInTheDocument();
    expect(screen.queryByText(SHOW_ALL)).toBeNull();
    await waitFor(() => expect(screen.getByText('Item 4')).toBeVisible(), COLLAPSE_TIMEOUT_WAIT);
  });

  test('"Show less" hides the overflow items again; they stay mounted', async () => {
    const user = userEvent.setup();
    renderShowMore();
    await user.click(screen.getByText(SHOW_ALL));
    await user.click(screen.getByText(SHOW_LESS));
    expect(screen.getByText(SHOW_ALL)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Item 4')).not.toBeVisible(), COLLAPSE_TIMEOUT_WAIT);
    expect(screen.getByText('Item 4')).toBeInTheDocument();
  });

  test('[bug-lock] onShowMore / onShowLess are never called', async () => {
    // Baseline characterization: not a promised contract.
    const user = userEvent.setup();
    const onShowMore = vi.fn();
    const onShowLess = vi.fn();
    renderShowMore({ onShowMore, onShowLess } as Partial<ListShowMoreProps>);
    await user.click(screen.getByText(SHOW_ALL));
    await user.click(screen.getByText(SHOW_LESS));
    // CURRENT BEHAVIOUR (suspected bug): onShowMore/onShowLess are in ListProps but ListShowMore ignores them.
    expect(onShowMore).not.toHaveBeenCalled();
    expect(onShowLess).not.toHaveBeenCalled();
  });
});
