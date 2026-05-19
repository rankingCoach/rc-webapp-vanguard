import { cleanup, render } from '@test-utils/test-utils';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { ModalSplitView, SplitViewElement } from './ModalSplitView';

const setInnerWidth = (value: number) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value,
  });
};

const elements: [SplitViewElement, SplitViewElement] = [
  {
    fullWidth: '100%',
    contractedWidth: '25%',
    component: <div data-testid="left-panel">LEFT</div>,
  },
  {
    fullWidth: '75%',
    contractedWidth: '75%',
    component: <div data-testid="right-panel">RIGHT</div>,
  },
];

describe('ModalSplitView', () => {
  beforeEach(() => {
    setInnerWidth(1200);
  });

  afterEach(() => {
    cleanup();
  });

  describe('basic rendering', () => {
    test('renders with null elements', () => {
      const { container } = render(<ModalSplitView isContracted={true} elements={[null, null]} />);
      expect(container.querySelector('.SplitView-left-component')).not.toBeNull();
      expect(container.querySelector('.SplitView-right-component')).not.toBeNull();
    });

    test('renders left and right components', () => {
      const { getByTestId } = render(<ModalSplitView isContracted={true} elements={elements} />);
      expect(getByTestId('left-panel')).not.toBeNull();
      expect(getByTestId('right-panel')).not.toBeNull();
    });
  });

  describe('left-overlay mode (default)', () => {
    test('right panel sits beside left using contractedWidth as left offset', () => {
      const { container } = render(<ModalSplitView isContracted={true} elements={elements} />);
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.style.left).toBe('25%');
      expect(right.style.width).toBe('75%');
    });

    test('right panel has no overlay modifier classes', () => {
      const { container } = render(<ModalSplitView isContracted={true} elements={elements} />);
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.className).not.toContain('SplitView-right-component--overlay');
      expect(right.className).not.toContain('SplitView-right-component--with-bottom-margin');
    });

    test('explicit collapseMode="left-overlay" matches default', () => {
      const { container } = render(
        <ModalSplitView isContracted={true} collapseMode="left-overlay" elements={elements} />,
      );
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.style.left).toBe('25%');
      expect(right.className).not.toContain('SplitView-right-component--overlay');
    });

    test('renders when isContracted=false (right hidden via opacity spring)', () => {
      const { container, getByTestId } = render(<ModalSplitView isContracted={false} elements={elements} />);
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(getByTestId('right-panel')).not.toBeNull();
      expect(right.style.left).toBe('25%');
    });
  });

  describe('right-overlay mode — above autoCloseWidth (desktop)', () => {
    test('behaves like left-overlay side-by-side when no autoCloseWidth set', () => {
      const { container } = render(
        <ModalSplitView isContracted={true} collapseMode="right-overlay" elements={elements} />,
      );
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.className).not.toContain('SplitView-right-component--overlay');
      expect(right.style.left).toBe('25%');
      expect(right.style.width).toBe('75%');
    });

    test('side-by-side when window width >= autoCloseWidth', () => {
      setInnerWidth(1200);
      const { container } = render(
        <ModalSplitView isContracted={true} collapseMode="right-overlay" autoCloseWidth={850} elements={elements} />,
      );
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.className).not.toContain('SplitView-right-component--overlay');
      expect(right.style.left).toBe('25%');
      expect(right.style.width).toBe('75%');
    });
  });

  describe('right-overlay mode — below autoCloseWidth (mobile)', () => {
    beforeEach(() => {
      setInnerWidth(500);
    });

    test('applies overlay modifier class', () => {
      const { container } = render(
        <ModalSplitView isContracted={true} collapseMode="right-overlay" autoCloseWidth={850} elements={elements} />,
      );
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.className).toContain('SplitView-right-component--overlay');
    });

    test('right panel covers full width anchored to right edge', () => {
      const { container } = render(
        <ModalSplitView isContracted={true} collapseMode="right-overlay" autoCloseWidth={850} elements={elements} />,
      );
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.style.right).toBe('0px');
      expect(right.style.width).toBe('100%');
    });

    test('right panel takes full height when no bottomMargin', () => {
      const { container } = render(
        <ModalSplitView isContracted={true} collapseMode="right-overlay" autoCloseWidth={850} elements={elements} />,
      );
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.style.bottom).toBe('0px');
      expect(right.style.height).toBe('100vh');
      expect(right.className).not.toContain('SplitView-right-component--with-bottom-margin');
    });

    test('applies bottom margin styles and modifier class', () => {
      const { container } = render(
        <ModalSplitView
          isContracted={true}
          collapseMode="right-overlay"
          autoCloseWidth={850}
          bottomMargin="150px"
          elements={elements}
        />,
      );
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.className).toContain('SplitView-right-component--with-bottom-margin');
      expect(right.style.bottom).toBe('150px');
      expect(right.style.height).toBe('calc(100vh - 150px)');
    });

    test('overlay activates regardless of isContracted (style still applied)', () => {
      const { container } = render(
        <ModalSplitView isContracted={false} collapseMode="right-overlay" autoCloseWidth={850} elements={elements} />,
      );
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.className).toContain('SplitView-right-component--overlay');
      expect(right.style.width).toBe('100%');
    });
  });

  describe('left element background color', () => {
    test('uses element backgroundColor when provided', () => {
      const elementsWithBg: [SplitViewElement, SplitViewElement] = [
        {
          fullWidth: '100%',
          contractedWidth: '25%',
          backgroundColor: 'rgb(255, 0, 0)',
          component: <div>LEFT</div>,
        },
        null,
      ];
      const { container } = render(<ModalSplitView isContracted={true} elements={elementsWithBg} />);
      const left = container.querySelector('.SplitView-left-component') as HTMLElement;
      expect(left.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });
  });

  describe('window resize', () => {
    test('left-overlay variant initial width is driven by shared useWindowResize hook', () => {
      // Below autoCloseWidth: window too narrow, isOpen=false → left spring targets fullWidth.
      setInnerWidth(500);
      const narrow = render(<ModalSplitView isContracted={true} autoCloseWidth={850} elements={elements} />);
      const leftNarrow = narrow.container.querySelector('.SplitView-left-component') as HTMLElement;
      expect(leftNarrow.style.width).toBe('100%');
      narrow.unmount();

      // Above autoCloseWidth: isOpen=true → left spring targets contractedWidth synchronously on mount.
      setInnerWidth(1200);
      const wide = render(<ModalSplitView isContracted={true} autoCloseWidth={850} elements={elements} />);
      const leftWide = wide.container.querySelector('.SplitView-left-component') as HTMLElement;
      expect(leftWide.style.width).toBe('25%');
    });

    test('switches between side-by-side and overlay on resize', () => {
      setInnerWidth(1200);
      const { container, rerender } = render(
        <ModalSplitView isContracted={true} collapseMode="right-overlay" autoCloseWidth={850} elements={elements} />,
      );
      let right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.className).not.toContain('SplitView-right-component--overlay');

      setInnerWidth(500);
      window.dispatchEvent(new Event('resize'));
      rerender(
        <ModalSplitView isContracted={true} collapseMode="right-overlay" autoCloseWidth={850} elements={elements} />,
      );
      right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.className).toContain('SplitView-right-component--overlay');
    });
  });
});
