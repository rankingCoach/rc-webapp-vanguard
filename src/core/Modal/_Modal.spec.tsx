import { appScreen, cleanup, fireEvent, render } from '@test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import { Modal } from '@vanguard/Modal/Modal';
import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

const CLOSE_BTN = 'modal-close-cta';

afterEach(() => {
  cleanup();
});

describe('Modal close button', () => {
  test('does not render a close button when onClose is not provided', () => {
    render(
      <Modal>
        <div>content</div>
      </Modal>,
    );

    expect(appScreen.queryByTestId(CLOSE_BTN)).toBeNull();
  });

  test('renders a close button when onClose is provided', () => {
    render(
      <Modal onClose={vi.fn()}>
        <div>content</div>
      </Modal>,
    );

    expect(appScreen.queryByTestId(CLOSE_BTN)).not.toBeNull();
  });

  test('clicking the close button calls onClose', async () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose}>
        <div>content</div>
      </Modal>,
    );

    const user = userEvent.setup();
    await user.click(appScreen.getByTestId(CLOSE_BTN));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('showCloseButton={false} hides the button even when onClose is provided', () => {
    render(
      <Modal onClose={vi.fn()} showCloseButton={false}>
        <div>content</div>
      </Modal>,
    );

    expect(appScreen.queryByTestId(CLOSE_BTN)).toBeNull();
  });

  test('hideCloseButtonOnMobile adds the mobile-hide class only when requested', () => {
    // The positioning classes live on the wrapper div around the Button.
    const { container, rerender } = render(
      <Modal onClose={vi.fn()}>
        <div>content</div>
      </Modal>,
    );
    expect(container.querySelector('.modal-close-btn')).not.toBeNull();
    expect(container.querySelector('.modal-close-btn-hidden-mobile')).toBeNull();

    rerender(
      <Modal onClose={vi.fn()} hideCloseButtonOnMobile>
        <div>content</div>
      </Modal>,
    );
    expect(container.querySelector('.modal-close-btn-hidden-mobile')).not.toBeNull();
  });
});

describe('Modal Esc-to-close', () => {
  test('Escape calls onClose by default', () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose}>
        <div>content</div>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('Escape does not call onClose when closeOnEsc is false', () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose} closeOnEsc={false}>
        <div>content</div>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  test('Escape does nothing without onClose', () => {
    render(
      <Modal>
        <div>content</div>
      </Modal>,
    );

    // No throw / no handler — just assert the modal is still mounted.
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(appScreen.queryByText('content')).not.toBeNull();
  });

  test('only the topmost (last-mounted) modal closes on Escape', () => {
    const onCloseBottom = vi.fn();
    const onCloseTop = vi.fn();
    render(
      <>
        <Modal onClose={onCloseBottom}>
          <div>bottom</div>
        </Modal>
        <Modal onClose={onCloseTop}>
          <div>top</div>
        </Modal>
      </>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCloseTop).toHaveBeenCalledTimes(1);
    expect(onCloseBottom).not.toHaveBeenCalled();
  });
});

describe('Modal outside-click close', () => {
  test('overlay click calls onClose by default', () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose} testId="overlay">
        <div>content</div>
      </Modal>,
    );

    fireEvent.click(appScreen.getByTestId('overlay'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('clicking inside the content does not call onClose', () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose} testId="overlay">
        <div data-testid="inner">content</div>
      </Modal>,
    );

    fireEvent.click(appScreen.getByTestId('inner'));

    expect(onClose).not.toHaveBeenCalled();
  });

  test('overlay click does not call onClose when closeOnOutsideClick is false', () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose} closeOnOutsideClick={false} testId="overlay">
        <div>content</div>
      </Modal>,
    );

    fireEvent.click(appScreen.getByTestId('overlay'));

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('Modal outerContent slot', () => {
  test('renders outer content outside the panel, inside the wrapper', () => {
    const { container } = render(
      <Modal outerContent={<button data-testid="outer-btn">nav</button>}>
        <div>content</div>
      </Modal>,
    );

    const outer = container.querySelector('.modal-content-wrapper > .modal-outer-content');
    expect(outer).not.toBeNull();
    expect(outer!.querySelector('[data-testid="outer-btn"]')).not.toBeNull();
    // The slot is a sibling of the panel, not a child of it.
    expect(container.querySelector('.modal-content [data-testid="outer-btn"]')).toBeNull();
  });

  test('does not render the wrapper without outerContent (backward-compatible DOM)', () => {
    const { container } = render(
      <Modal>
        <div>content</div>
      </Modal>,
    );

    expect(container.querySelector('.modal-content-wrapper')).toBeNull();
    expect(container.querySelector('.modal-outer-content')).toBeNull();
    expect(container.querySelector('.rc-modal > .modal-content')).not.toBeNull();
  });

  test('clicking outer content does not trigger outside-click close', () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose} testId="overlay" outerContent={<button data-testid="outer-btn">nav</button>}>
        <div>content</div>
      </Modal>,
    );

    fireEvent.click(appScreen.getByTestId('outer-btn'));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(appScreen.getByTestId('overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
