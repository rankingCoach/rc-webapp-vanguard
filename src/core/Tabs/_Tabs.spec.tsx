import '@testing-library/jest-dom/vitest';

import { fireEvent, render, waitFor } from '@test-utils/test-utils';
import React from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

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

  describe('overflow scroll buttons', () => {
    // jsdom has no layout: make every element report 1000px of content in a 300px viewport, so the bar overflows
    beforeEach(() => {
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, get: () => 1000 });
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 300 });
    });
    afterEach(() => {
      delete (HTMLElement.prototype as any).scrollWidth;
      delete (HTMLElement.prototype as any).clientWidth;
      vi.restoreAllMocks();
    });

    test('do not submit an enclosing form', () => {
      const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
      const { getByLabelText } = render(
        <form onSubmit={onSubmit}>
          <Tabs tabs={tabs} />
        </form>,
      );
      const end = getByLabelText('Scroll to end');
      expect(end).toHaveAttribute('type', 'button');
      expect(end).toBeEnabled();

      fireEvent.click(end);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    test('carets and shadows follow a CSS-only direction (style={{ direction: "rtl" }})', async () => {
      // jsdom does not inherit `direction` in getComputedStyle: resolve it from the closest inline style
      const getComputedStyle = window.getComputedStyle.bind(window);
      vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
        const style = getComputedStyle(element, pseudo);
        const direction = (element as HTMLElement).closest<HTMLElement>('[style*="direction"]')?.style.direction;
        return direction ? ({ ...style, direction } as CSSStyleDeclaration) : style;
      });
      const caretOf = (button: HTMLElement) => button.querySelector('svg')?.innerHTML;

      const ltr = render(<Tabs tabs={tabs} testId="ltr" />);
      const rtl = render(<Tabs tabs={tabs} testId="rtl" style={{ direction: 'rtl' }} />);
      const ltrStart = ltr.getByTestId('ltr-scroll-left_button');
      const ltrEnd = ltr.getByTestId('ltr-scroll-right_button');
      const rtlStart = rtl.getByTestId('rtl-scroll-left_button');
      const rtlEnd = rtl.getByTestId('rtl-scroll-right_button');
      // The icons load asynchronously
      await waitFor(() =>
        [ltrStart, ltrEnd, rtlStart, rtlEnd].forEach((button) => expect(caretOf(button)).toBeTruthy()),
      );

      expect(caretOf(ltrStart)).not.toBe(caretOf(ltrEnd));
      // In RTL the start is on the right: its caret points right, like the LTR end one, and vice versa
      expect(caretOf(rtlStart)).toBe(caretOf(ltrEnd));
      expect(caretOf(rtlEnd)).toBe(caretOf(ltrStart));

      // Shadows fall over the tabs: the right-hand shadow (the end in LTR, the start in RTL) shifts towards the left
      const shadowClasses = (container: HTMLElement) =>
        Array.from(container.querySelectorAll('[class*="scrollShadows"] > span'), (shadow) =>
          /TowardsLeft/.test(shadow.className),
        );
      expect(shadowClasses(ltr.container)).toEqual([false, true]);
      expect(shadowClasses(rtl.container)).toEqual([true, false]);
    });
  });
});
