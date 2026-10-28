import React, { useRef, useState } from 'react';
import { Button } from '@vanguard/Button/Button';
import { DropdownMenu } from '@vanguard/DropdownMenu/DropdownMenu';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalFooter } from '@vanguard/Modal/ModalFooter/ModalFooter';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { PopoverModal } from '@vanguard/PopoverModal/PopoverModal';
import { snackbarService } from '@vanguard/SnackbarRoot/SnackBarService';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllOverlays, readZ, Story, topmostElAt } from './_OverlayStacking.default';

const FOOTER_CTA_LABEL = 'Save series';
const MENU_ITEM_LABEL = 'Weekly';
const TOAST_MESSAGE = 'Series saved';

let nestedModalId: string | null = null;

const getBackdrop = () => document.querySelector('[data-testid="popover-modal-backdrop"]') as HTMLElement | null;
const getFooterCta = () => screen.getByText(FOOTER_CTA_LABEL).closest('button') as HTMLElement;

const PopoverModalOwner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const menuAnchorRef = useRef<HTMLDivElement | null>(null);

  const openNestedModal = () => {
    nestedModalId = ModalService.open(
      <Modal>
        <ModalHeader closeFn={() => ModalService.closeEv(nestedModalId)}>Nested Modal</ModalHeader>
        <div data-testid="modal-body-Nested Modal" style={{ padding: 40, minWidth: 360, minHeight: 160 }}>
          Opened from inside the PopoverModal.
        </div>
      </Modal>,
      { animation: 'pop' },
    );
  };

  return (
    <div ref={anchorRef} style={{ display: 'inline-block' }}>
      <Button testId="popover-modal-trigger" onClick={() => setIsOpen(true)}>
        Review schedule
      </Button>
      <PopoverModal
        isOpen={isOpen}
        anchorEl={anchorRef.current}
        placement="bottom"
        renderInPortal
        dimRestOfPage
        onClose={() => setIsOpen(false)}
        content={
          <div
            data-testid="popover-modal-content"
            style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
          >
            <div style={{ marginBottom: 12 }}>PopoverModal content</div>
            <div ref={menuAnchorRef} style={{ display: 'inline-block', marginRight: 8 }}>
              <Button testId="popover-menu-trigger" onClick={() => setIsMenuOpen((v) => !v)}>
                Open menu
              </Button>
            </div>
            <DropdownMenu
              anchorEl={menuAnchorRef}
              isOpen={isMenuOpen}
              toggleIsOpen={() => setIsMenuOpen((v) => !v)}
              items={[{ title: 'Daily' }, { title: MENU_ITEM_LABEL }, { title: 'Monthly' }]}
            />
            <Button testId="popover-nested-modal-trigger" onClick={openNestedModal}>
              Open modal
            </Button>
          </div>
        }
      />
    </div>
  );
};

const FullscreenBody = () => {
  const [clicks, setClicks] = useState(0);
  return (
    <Modal fullscreen={true}>
      <ModalHeader closeFn={() => ModalService.closeAllModals()}>Fullscreen Stepper</ModalHeader>
      <div data-testid="modal-body-Fullscreen Stepper" style={{ padding: 40, minHeight: '60vh', fontSize: 18 }}>
        <div style={{ marginBottom: 16 }}>
          Footer CTA clicks: <span data-testid="footer-cta-clicks">{clicks}</span>
        </div>
        <PopoverModalOwner />
      </div>
      <ModalFooter positive={{ text: FOOTER_CTA_LABEL, cta: () => setClicks((c) => c + 1) }} />
    </Modal>
  );
};

const FullscreenModalLauncher = () => (
  <Button onClick={() => ModalService.openSlide(<FullscreenBody />, { fullscreen: true })}>Open Fullscreen Modal</Button>
);

/** Open the fullscreen slide modal and the dimmed PopoverModal inside it; resolves once both have settled. */
const openFullscreenWithPopoverModal = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: /open fullscreen modal/i }));
  await waitFor(() => expect(screen.getByTestId('modal-body-Fullscreen Stepper')).toBeInTheDocument());
  await new Promise((r) => setTimeout(r, 400));
  await userEvent.click(screen.getByTestId('popover-modal-trigger'));
  await waitFor(() => expect(screen.getByTestId('popover-modal-content')).toBeVisible());
  await waitFor(() => expect(topmostElAt(getFooterCta())).toBe(getBackdrop()));
};

/**
 * PopoverModal (renderInPortal + dimRestOfPage) inside a fullscreen slide modal with a fixed footer.
 *
 * The fullscreen `.modal-footer` is `position: fixed; z-index: 1200` inside `.modalRoot`'s stacking context.
 * Before the fix only the card was portaled; the backdrop stayed inline in `.modalRoot` at slot − 1 (< 1200),
 * so the footer CTA painted above the dim and stayed clickable. Now the backdrop is portaled with the card
 * and must cover the footer, while overlays opened from the popover still land on top of both.
 */
export const FullscreenModalPopoverModal: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    // 1. fullscreen slide modal with a fixed footer
    await userEvent.click(canvas.getByRole('button', { name: /open fullscreen modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Fullscreen Stepper')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 400));

    // 2. open the dimmed, portaled PopoverModal from inside it
    await userEvent.click(screen.getByTestId('popover-modal-trigger'));
    await waitFor(() => expect(screen.getByTestId('popover-modal-content')).toBeVisible());
    await new Promise((r) => setTimeout(r, 300));

    const backdrop = getBackdrop()!;
    await expect(backdrop).not.toBeNull();
    await expect(backdrop.parentElement).toBe(document.body);

    const modalRoot = screen.getByTestId('modal-body-Fullscreen Stepper').closest('.modalRoot') as HTMLElement;
    const popperRoot = screen.getByTestId('popover-modal-content').closest('.MuiPopper-root') as HTMLElement;
    await expect(readZ(backdrop)).toBeGreaterThan(readZ(modalRoot));
    await expect(readZ(popperRoot)).toBeGreaterThan(readZ(backdrop));

    // The footer CTA is dimmed: the backdrop, not the button, is hit at its centre. `waitFor` lets the
    // slide-in animation settle (the fixed footer sits off-viewport inside the transformed modal until then).
    await waitFor(() => expect(topmostElAt(getFooterCta())).toBe(backdrop));

    // 3. DropdownMenu opened from the popover content is topmost
    await userEvent.click(screen.getByTestId('popover-menu-trigger'));
    await waitFor(() => expect(screen.getByText(MENU_ITEM_LABEL)).toBeVisible());
    await new Promise((r) => setTimeout(r, 250));
    const menuItem = screen.getByText(MENU_ITEM_LABEL);
    const menuRoot = menuItem.closest('.MuiPopper-root') as HTMLElement;
    await expect(readZ(menuRoot)).toBeGreaterThan(readZ(popperRoot));
    const topAtMenu = topmostElAt(menuItem);
    await expect(topAtMenu && menuRoot.contains(topAtMenu)).toBe(true);
    await userEvent.click(screen.getByTestId('popover-menu-trigger'));
    await waitFor(() => expect(screen.queryByText(MENU_ITEM_LABEL)).toBeNull());

    // 4. ModalService.open modal opened from the popover content is topmost
    await userEvent.click(screen.getByTestId('popover-nested-modal-trigger'));
    await waitFor(() => expect(screen.getByTestId('modal-body-Nested Modal')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));
    const nestedBody = screen.getByTestId('modal-body-Nested Modal');
    const nestedRoot = nestedBody.closest('.modalRoot') as HTMLElement;
    await expect(readZ(nestedRoot)).toBeGreaterThan(readZ(popperRoot));
    const topAtNested = topmostElAt(nestedBody);
    await expect(topAtNested && nestedBody.contains(topAtNested)).toBe(true);
    await ModalService.closeEv(nestedModalId);
    await waitFor(() => expect(screen.queryByTestId('modal-body-Nested Modal')).toBeNull());
    await new Promise((r) => setTimeout(r, 350));

    // 5. clicking the backdrop closes the popover; the footer is reachable again
    await userEvent.click(getBackdrop()!);
    await waitFor(() => expect(screen.queryByTestId('popover-modal-content')).toBeNull());
    await waitFor(() => expect(getBackdrop()).toBeNull());
    const footerCta = getFooterCta();
    await waitFor(() => {
      const topAtFooter = topmostElAt(footerCta);
      expect(topAtFooter && footerCta.contains(topAtFooter)).toBe(true);
    });
    await userEvent.click(footerCta);
    await waitFor(() => expect(screen.getByTestId('footer-cta-clicks')).toHaveTextContent('1'));

    await closeAllOverlays();
  },
  render: () => <FullscreenModalLauncher />,
};

/**
 * Regression: dimmed PopoverModal on a plain page (no modal). Dim + click-outside-to-close are unchanged.
 */
export const PlainPagePopoverModal: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    for (const renderInPortal of [false, true]) {
      await userEvent.click(canvas.getByTestId(`plain-trigger-${renderInPortal}`));
      await waitFor(() => expect(screen.getByTestId('popover-modal-content')).toBeVisible());
      await new Promise((r) => setTimeout(r, 250));

      const backdrop = getBackdrop()!;
      await expect(backdrop.parentElement === document.body).toBe(renderInPortal);
      await expect(topmostElAt(canvas.getByTestId('plain-page-text'))).toBe(backdrop);

      await userEvent.click(backdrop);
      await waitFor(() => expect(screen.queryByTestId('popover-modal-content')).toBeNull());
      await waitFor(() => expect(getBackdrop()).toBeNull());
    }
  },
  render: () => {
    const Owner = ({ renderInPortal }: { renderInPortal: boolean }) => {
      const [isOpen, setIsOpen] = useState(false);
      const anchorRef = useRef<HTMLDivElement | null>(null);
      return (
        <div ref={anchorRef} style={{ display: 'inline-block', marginRight: 16 }}>
          <Button testId={`plain-trigger-${renderInPortal}`} onClick={() => setIsOpen(true)}>
            {renderInPortal ? 'Open portaled PopoverModal' : 'Open inline PopoverModal'}
          </Button>
          <PopoverModal
            isOpen={isOpen}
            anchorEl={anchorRef.current}
            placement="bottom"
            renderInPortal={renderInPortal}
            dimRestOfPage
            onClose={() => setIsOpen(false)}
            content={
              <div data-testid="popover-modal-content" style={{ background: 'white', padding: 16, borderRadius: 8 }}>
                PopoverModal content
              </div>
            }
          />
        </div>
      );
    };

    return (
      <div style={{ padding: 40 }}>
        <div data-testid="plain-page-text" style={{ marginBottom: 200, padding: 24 }}>
          Plain page content
        </div>
        <Owner renderInPortal={false} />
        <Owner renderInPortal={true} />
      </div>
    );
  },
};

/**
 * Toast vs the PopoverModal dim, inside a fullscreen modal.
 *
 * Snackbar toasts are not in the OverlayStackingService ledger: MUI pins them at `theme.zIndex.snackbar` (1400),
 * above any normal overlay stack (1101+). Expected — and identical to how toasts behave over a plain Modal/Drawer:
 * the toast stays undimmed and on top, while the footer below the popover stays dimmed.
 * NOTE: no clicks after the toast opens — MUI Snackbar closes itself on click-away.
 */
export const FullscreenModalPopoverModalToast: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    await closeAllOverlays();
    await openFullscreenWithPopoverModal(canvasElement);

    snackbarService.openSuccessSnackbar(TOAST_MESSAGE);
    await waitFor(() => expect(screen.getByText(TOAST_MESSAGE)).toBeVisible());
    await new Promise((r) => setTimeout(r, 400)); // slide-in

    const backdrop = getBackdrop()!;
    const modalRoot = screen.getByTestId('modal-body-Fullscreen Stepper').closest('.modalRoot') as HTMLElement;
    const popperRoot = screen.getByTestId('popover-modal-content').closest('.MuiPopper-root') as HTMLElement;
    const toast = screen.getByText(TOAST_MESSAGE);
    const toastRoot = toast.closest('.MuiSnackbar-root') as HTMLElement;

    // Order: parent modal < backdrop < card < toast (static 1400, outside the ledger).
    await expect(readZ(backdrop)).toBeGreaterThan(readZ(modalRoot));
    await expect(readZ(popperRoot)).toBeGreaterThan(readZ(backdrop));
    await expect(readZ(toastRoot)).toBeGreaterThan(readZ(popperRoot));

    // The toast paints above the dim; the footer CTA is still dimmed.
    await waitFor(() => {
      const topAtToast = topmostElAt(toast);
      expect(topAtToast && toastRoot.contains(topAtToast)).toBe(true);
    });
    await expect(topmostElAt(getFooterCta())).toBe(backdrop);

    await closeAllOverlays();
  },
  render: () => <FullscreenModalLauncher />,
};
