import '@testing-library/jest-dom/vitest';

import { fireEvent, render } from '@test-utils/test-utils';
import React from 'react';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { Tabs } from './Tabs';

describe('TabList component tests', () => {
  beforeAll(() => {
    // jsdom lacks ResizeObserver; harmless stub for scroll measuring
    if (!(globalThis as any).ResizeObserver) {
      (globalThis as any).ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
  });

  const tabs = [
    {
      label: 'General keywords',
      component: <h2>General keywords tab</h2>,
    },
    {
      label: 'Negative keywords',
      component: <h2>Negative keywords tab</h2>,
    },
    {
      label: 'Brand keywords',
      component: <h2>Brand keywords tab</h2>,
    },
  ];

  test('should render', () => {
    render(<Tabs tabs={tabs} />);
  });

  test('renders string-valued tabs with correct aria-selected', () => {
    const stringTabs = [
      { label: 'Alpha', value: 'alpha' },
      { label: 'Beta', value: 'beta' },
      { label: 'Gamma', value: 'gamma' },
    ];
    const { getByRole } = render(<Tabs tabs={stringTabs} value="beta" />);
    expect(getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'false');
    expect(getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
    expect(getByRole('tab', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'false');
  });

  test('selects first tab by index when value is undefined', () => {
    const { getByRole } = render(<Tabs tabs={tabs} />);
    expect(getByRole('tab', { name: 'General keywords' })).toHaveAttribute('aria-selected', 'true');
    expect(getByRole('tab', { name: 'Brand keywords' })).toHaveAttribute('aria-selected', 'false');
  });

  test('empty tabs array does not throw', () => {
    expect(() => render(<Tabs tabs={[]} />)).not.toThrow();
  });

  test('onChange fires on click, including the already-selected tab', () => {
    const onChange = vi.fn();
    const stringTabs = [
      { label: 'Alpha', value: 'alpha' },
      { label: 'Beta', value: 'beta' },
    ];
    const { getByRole } = render(<Tabs tabs={stringTabs} value="alpha" onChange={onChange} />);

    fireEvent.click(getByRole('tab', { name: 'Alpha' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][1]).toBe('alpha');

    fireEvent.click(getByRole('tab', { name: 'Beta' }));
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange.mock.calls[1][1]).toBe('beta');
  });

  test('disabled tab is hidden from the bar', () => {
    const withDisabled = [
      { label: 'Visible', value: 'a' },
      { label: 'Hidden', value: 'b', disabled: true },
    ];
    const { queryByRole, getByRole } = render(<Tabs tabs={withDisabled} />);
    expect(getByRole('tab', { name: 'Visible' })).toBeInTheDocument();
    expect(queryByRole('tab', { name: 'Hidden' })).toBeNull();
  });

  test('testId is applied as `${testId}-${index}` using the array index', () => {
    const { getByTestId } = render(<Tabs tabs={tabs} testId="my-tabs" />);
    expect(getByTestId('my-tabs-0')).toBeInTheDocument();
    expect(getByTestId('my-tabs-1')).toBeInTheDocument();
    expect(getByTestId('my-tabs-2')).toBeInTheDocument();
  });
});
