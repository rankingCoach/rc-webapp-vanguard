import { appScreen, cleanup, fireEvent, render } from '@test-utils/test-utils';
import { NavigationModal, NavigationModalProps } from '@vanguard/Modal/NavigationModal/NavigationModal';
import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

const PREV_BTN = 'navigation-modal-prev_button';
const NEXT_BTN = 'navigation-modal-next_button';
const COUNTER = 'navigation-modal-counter';

afterEach(() => {
  cleanup();
});

const renderModal = (props: Partial<NavigationModalProps> = {}) => {
  const onNavigate = vi.fn();
  const utils = render(
    <NavigationModal activeIndex={0} totalItems={5} onNavigate={onNavigate} {...props}>
      <div>content</div>
    </NavigationModal>,
  );
  return { onNavigate, ...utils };
};

const getButton = (testId: string) => appScreen.getByTestId(testId) as HTMLButtonElement;

describe('NavigationModal arrows', () => {
  test('next/prev clicks call onNavigate with the adjacent index', () => {
    const { onNavigate } = renderModal({ activeIndex: 2 });

    fireEvent.click(getButton(NEXT_BTN));
    expect(onNavigate).toHaveBeenLastCalledWith(3);

    fireEvent.click(getButton(PREV_BTN));
    expect(onNavigate).toHaveBeenLastCalledWith(1);
  });

  test('without loop, prev is disabled at the first item', () => {
    const { onNavigate } = renderModal({ activeIndex: 0 });

    expect(getButton(PREV_BTN).disabled).toBe(true);
    fireEvent.click(getButton(PREV_BTN));
    expect(onNavigate).not.toHaveBeenCalled();
  });

  test('without loop, next is disabled at the last item', () => {
    const { onNavigate } = renderModal({ activeIndex: 4 });

    expect(getButton(NEXT_BTN).disabled).toBe(true);
    fireEvent.click(getButton(NEXT_BTN));
    expect(onNavigate).not.toHaveBeenCalled();
  });

  test('with loop, navigation wraps around at both ends', () => {
    const { onNavigate } = renderModal({ activeIndex: 0, loop: true });

    expect(getButton(PREV_BTN).disabled).toBe(false);
    fireEvent.click(getButton(PREV_BTN));
    expect(onNavigate).toHaveBeenLastCalledWith(4);

    cleanup();

    const { onNavigate: onNavigateAtEnd } = renderModal({ activeIndex: 4, loop: true });
    fireEvent.click(getButton(NEXT_BTN));
    expect(onNavigateAtEnd).toHaveBeenLastCalledWith(0);
  });

  test('arrows are not rendered for a single item', () => {
    renderModal({ totalItems: 1 });

    expect(appScreen.queryByTestId('navigation-modal-prev')).toBeNull();
    expect(appScreen.queryByTestId('navigation-modal-next')).toBeNull();
  });

  test('clicking an arrow does not trigger outside-click close', () => {
    const onClose = vi.fn();
    renderModal({ activeIndex: 2, onClose, testId: 'overlay' });

    fireEvent.click(getButton(NEXT_BTN));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(appScreen.getByTestId('overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('NavigationModal keyboard navigation', () => {
  test('ArrowRight/ArrowLeft call onNavigate with the adjacent index', () => {
    const { onNavigate } = renderModal({ activeIndex: 2 });

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(onNavigate).toHaveBeenLastCalledWith(3);

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(onNavigate).toHaveBeenLastCalledWith(1);
  });

  test('ArrowLeft at the first item without loop does nothing', () => {
    const { onNavigate } = renderModal({ activeIndex: 0 });

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(onNavigate).not.toHaveBeenCalled();
  });

  test('keyboardNavigation={false} detaches the key handling', () => {
    const { onNavigate } = renderModal({ activeIndex: 2, keyboardNavigation: false });

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(onNavigate).not.toHaveBeenCalled();
  });

  test('arrow keys are ignored while typing in an input', () => {
    const onNavigate = vi.fn();
    render(
      <NavigationModal activeIndex={2} totalItems={5} onNavigate={onNavigate}>
        <input data-testid="field" />
      </NavigationModal>,
    );

    fireEvent.keyDown(appScreen.getByTestId('field'), { key: 'ArrowRight' });
    expect(onNavigate).not.toHaveBeenCalled();
  });
});

describe('NavigationModal counter', () => {
  test('shows the 1-based position and the total', () => {
    renderModal({ activeIndex: 2, totalItems: 30 });

    expect(appScreen.getByTestId(COUNTER).textContent).toContain('3 of 30');
  });

  test('is still shown for a single item', () => {
    renderModal({ totalItems: 1 });

    expect(appScreen.getByTestId(COUNTER).textContent).toContain('1 of 1');
  });

  test('hideCounter removes it', () => {
    renderModal({ hideCounter: true });

    expect(appScreen.queryByTestId(COUNTER)).toBeNull();
  });
});
