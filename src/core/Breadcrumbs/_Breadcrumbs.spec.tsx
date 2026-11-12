import '@testing-library/jest-dom/vitest';

import { render, screen } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { Breadcrumbs } from './Breadcrumbs';

describe('Breadcrumbs', () => {
  test('renders a breadcrumb navigation with the custom separator between entries', () => {
    render(
      <Breadcrumbs separator="→" className="custom">
        <a href="/home">Home</a>
        <span>Admin</span>
        <span>Users</span>
      </Breadcrumbs>,
    );
    const nav = screen.getByTestId('breadcrumbs');
    expect(nav.tagName).toBe('NAV');
    expect(nav).toHaveAttribute('aria-label', 'breadcrumb');
    expect(nav).toHaveClass('custom');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getAllByText('→')).toHaveLength(2);
  });

  test('maxItems collapses the middle entries', () => {
    render(
      <Breadcrumbs maxItems={2} testId="bc">
        <span>One</span>
        <span>Two</span>
        <span>Three</span>
      </Breadcrumbs>,
    );
    expect(screen.queryByText('Two')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Show path')).toBeInTheDocument();
  });
});
