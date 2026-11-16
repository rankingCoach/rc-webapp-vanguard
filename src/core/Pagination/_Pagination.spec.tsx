import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { Pagination } from './Pagination';

describe('Pagination', () => {
  test('renders the pages and marks the controlled current page', () => {
    render(<Pagination count={5} page={2} shape="rounded" className="custom" />);
    expect(screen.getByTestId('pagination')).toHaveClass('custom');
    expect(screen.getByRole('button', { name: 'page 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Go to page 5' })).toBeInTheDocument();
  });

  test('onChange receives the 1-based page (RankingsInsightWidget pattern)', () => {
    const onChange = vi.fn();
    render(<Pagination count={5} page={1} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to page 3' }));
    expect(onChange).toHaveBeenCalledWith(expect.anything(), 3);
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), 2);
  });

  test('disabled disables every page button', () => {
    render(<Pagination count={3} disabled />);
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
  });
});
