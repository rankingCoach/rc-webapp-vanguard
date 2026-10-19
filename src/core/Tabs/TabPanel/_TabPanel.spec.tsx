import '@testing-library/jest-dom/vitest';

import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { TabPanel } from './TabPanel';

describe('TabPanel component tests', () => {
  test('should render', () => {
    render(<TabPanel currentTab={1} value={1} />);
  });

  test('renders children when active and nothing when inactive', () => {
    const { rerender, queryByRole } = render(
      <TabPanel currentTab="a" value="a">
        content
      </TabPanel>,
    );
    expect(queryByRole('tabpanel')).toHaveTextContent('content');
    rerender(
      <TabPanel currentTab="b" value="a">
        content
      </TabPanel>,
    );
    expect(queryByRole('tabpanel')).toBeNull();
  });

  test('applies id, aria-labelledby, className and data-testid', () => {
    const { getByRole } = render(
      <TabPanel currentTab={1} value={1} id="p1" labelledBy="t1" className="extra" testId="panel-test" />,
    );
    const panel = getByRole('tabpanel');
    expect(panel).toHaveAttribute('id', 'p1');
    expect(panel).toHaveAttribute('aria-labelledby', 't1');
    expect(panel).toHaveClass('extra');
    expect(panel).toHaveAttribute('data-testid', 'panel-test');
  });

  test('keepInDom keeps inactive panel mounted but hidden', () => {
    const { getByText } = render(
      <TabPanel currentTab={0} value={1} keepInDom>
        kept
      </TabPanel>,
    );
    const el = getByText('kept');
    expect(el).toBeInTheDocument();
    expect(el.closest('[style*="display: none"]')).not.toBeNull();
  });
});
