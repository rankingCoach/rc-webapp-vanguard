import '@testing-library/jest-dom/vitest';

import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { TabsCustomScroll } from './TabsCustomScroll';

describe('TabsCustomScroll component tests', () => {
  test('should render', () => {
    render(<TabsCustomScroll direction={''} onClick={() => {}} disabled={false} />);
  });

  test('merges className, is aria-hidden and handles click', () => {
    const onClick = vi.fn();
    const { getByTestId } = render(
      <TabsCustomScroll direction="right" onClick={onClick} disabled={false} className="extra" testId="scroll" />,
    );
    const el = getByTestId('scroll');
    expect(el).toHaveClass('extra');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    el.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    const { getByTestId } = render(<TabsCustomScroll direction="left" onClick={onClick} disabled testId="scroll" />);
    getByTestId('scroll').click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
