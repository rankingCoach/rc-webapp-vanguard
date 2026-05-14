import React from 'react';
import { userEvent, within, expect, screen } from 'storybook/test';
import { ModalService } from '@vanguard/Modal/ModalService';
import { Modal } from '@vanguard/Modal/Modal';
import { Button } from '@vanguard/Button/Button';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ActionCard } from '@vanguard/ActionCard/ActionCard';
import { ActionCardHeader } from '@vanguard/ActionCard/ActionCardHeader/ActionCardHeader';
import { ActionCardActionProps } from '@vanguard/ActionCard/ActionCardActions/ActionCardAction/ActionCardAction';
import { Story, closeAllModals } from './_Modal.default';

const InnerModal = ({ close }: { close: () => void }) => {
  const actions: ActionCardActionProps[] = [
    { label: 'Primary Action', cta: () => {}, type: 'primary' },
    { label: 'Secondary Option A', cta: () => {}, type: 'secondary' },
    { label: 'Secondary Option B', cta: () => {}, type: 'secondary' },
  ];

  return (
    <Modal>
      <ModalHeader closeFn={close}>Inner Modal (slide)</ModalHeader>
      <div style={{ padding: '20px', minWidth: '400px' }}>
        <ActionCard actions={actions}>
          <ActionCardHeader actions={actions}>
            <span>Card with secondary actions</span>
          </ActionCardHeader>
          <div>Click the meatballs menu to open the popover.</div>
        </ActionCard>
      </div>
    </Modal>
  );
};

const OuterModal = () => {
  const openInner = () => {
    ModalService.open(<InnerModal close={() => ModalService.closeAllModals()} />, { animation: 'slide' });
  };

  return (
    <Modal>
      <ModalHeader closeFn={() => ModalService.closeAllModals()}>Outer Modal (grow)</ModalHeader>
      <div style={{ padding: '20px' }}>
        <Button onClick={openInner}>Open Inner Modal</Button>
      </div>
    </Modal>
  );
};

const hitTestPopover = async (popoverText: string) => {
  const popoverItem = await screen.findByText(popoverText);
  await expect(popoverItem).toBeVisible();
  const rect = popoverItem.getBoundingClientRect();
  const topEl = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) as HTMLElement | null;
  const popoverRoot = popoverItem.closest('.MuiPopper-root') as HTMLElement | null;
  await expect(popoverRoot).toBeTruthy();
  await expect(topEl).toBeTruthy();
  return { popoverRoot: popoverRoot!, topEl: topEl!, popoverItem };
};

export const ModalStackingPopover: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await closeAllModals();

    // 1. Open outer modal (grow animation)
    const openOuter = canvas.getByRole('button', { name: /open outer modal/i });
    await userEvent.click(openOuter);
    await expect(screen.getByText('Outer Modal (grow)')).toBeInTheDocument();

    // 2. From inside the outer modal, open the inner modal (slide animation)
    const openInner = await screen.findByRole('button', { name: /open inner modal/i });
    await userEvent.click(openInner);

    // Wait for the slide animation to finish
    await new Promise((resolve) => setTimeout(resolve, 500));

    await expect(screen.getByText('Inner Modal (slide)')).toBeInTheDocument();

    // 3. Click the ActionCard meatballs menu to open the secondary-actions popover
    const meatballsBtn = screen.getByTestId('action-card-header-open-menu-cta');
    await userEvent.click(meatballsBtn);

    // Wait for popper fade-in (250ms)
    await new Promise((resolve) => setTimeout(resolve, 350));

    // 4. The popover items must be in the document AND actually visible (on top of the stacked modal)
    const popoverItem = await screen.findByText('Secondary Option A');
    await expect(popoverItem).toBeInTheDocument();
    await expect(popoverItem).toBeVisible();

    // Hit-test: an element at the popover item's center must be the popover item (or a child),
    // not the modal overlay sitting above it. This is the assertion that fails today.
    const rect = popoverItem.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const topEl = document.elementFromPoint(cx, cy) as HTMLElement | null;
    await expect(topEl).toBeTruthy();
    const popoverRoot = popoverItem.closest('.MuiPopper-root') as HTMLElement | null;
    await expect(popoverRoot).toBeTruthy();
    await expect(popoverRoot!.contains(topEl)).toBe(true);

    await closeAllModals();
  },
  render: () => {
    const openOuter = () => {
      ModalService.open(<OuterModal />, { animation: 'grow' });
    };

    return (
      <div>
        <Button onClick={openOuter}>Open Outer Modal</Button>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Baseline: ActionCard popover with no modal in the stack. Popover must show
// above the page using the default BASE_Z_INDEX.
// ---------------------------------------------------------------------------
const PopoverCard = () => {
  const actions: ActionCardActionProps[] = [
    { label: 'Primary Action', cta: () => {}, type: 'primary' },
    { label: 'Secondary Baseline A', cta: () => {}, type: 'secondary' },
    { label: 'Secondary Baseline B', cta: () => {}, type: 'secondary' },
  ];
  return (
    <ActionCard actions={actions}>
      <ActionCardHeader actions={actions}>
        <span>Card (no modal)</span>
      </ActionCardHeader>
      <div>Baseline popover.</div>
    </ActionCard>
  );
};

export const PopoverNoModalBaseline: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    await closeAllModals();
    const canvas = within(canvasElement);

    const meatballsBtn = canvas.getByTestId('action-card-header-open-menu-cta');
    await userEvent.click(meatballsBtn);
    await new Promise((resolve) => setTimeout(resolve, 350));

    const { popoverRoot, topEl } = await hitTestPopover('Secondary Baseline A');
    await expect(popoverRoot.contains(topEl)).toBe(true);
  },
  render: () => (
    <div style={{ padding: '40px', width: '400px' }}>
      <PopoverCard />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Multiple ActionCards in the same modal. Opening one popover, then clicking
// the other meatballs button must close the first and open the second on top.
// ---------------------------------------------------------------------------
const MultiCardModal = ({ close }: { close: () => void }) => {
  const actionsA: ActionCardActionProps[] = [
    { label: 'Primary A', cta: () => {}, type: 'primary' },
    { label: 'Secondary Card A-1', cta: () => {}, type: 'secondary' },
  ];
  const actionsB: ActionCardActionProps[] = [
    { label: 'Primary B', cta: () => {}, type: 'primary' },
    { label: 'Secondary Card B-1', cta: () => {}, type: 'secondary' },
  ];
  return (
    <Modal>
      <ModalHeader closeFn={close}>Multi-Card Modal</ModalHeader>
      <div style={{ padding: '20px', minWidth: '500px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <ActionCard actions={actionsA}>
          <ActionCardHeader actions={actionsA}>
            <span data-testid="card-A-title">Card A</span>
          </ActionCardHeader>
          <div>First card.</div>
        </ActionCard>
        <ActionCard actions={actionsB}>
          <ActionCardHeader actions={actionsB}>
            <span data-testid="card-B-title">Card B</span>
          </ActionCardHeader>
          <div>Second card.</div>
        </ActionCard>
      </div>
    </Modal>
  );
};

export const MultiplePopoversInSameModal: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    await closeAllModals();
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /open multi-card modal/i }));
    await new Promise((resolve) => setTimeout(resolve, 300));

    const meatballs = screen.getAllByTestId('action-card-header-open-menu-cta');
    await expect(meatballs.length).toBe(2);

    // Open card A's popover
    await userEvent.click(meatballs[0]);
    await new Promise((resolve) => setTimeout(resolve, 350));
    const first = await hitTestPopover('Secondary Card A-1');
    await expect(first.popoverRoot.contains(first.topEl)).toBe(true);

    // Open card B's popover — first should close, second must be on top
    await userEvent.click(meatballs[1]);
    await new Promise((resolve) => setTimeout(resolve, 350));
    const second = await hitTestPopover('Secondary Card B-1');
    await expect(second.popoverRoot.contains(second.topEl)).toBe(true);

    await closeAllModals();
  },
  render: () => {
    const open = () => {
      ModalService.open(<MultiCardModal close={() => ModalService.closeAllModals()} />);
    };
    return <Button onClick={open}>Open Multi-Card Modal</Button>;
  },
};

// ---------------------------------------------------------------------------
// 3-deep modal stack (grow → slide → pop). Popover lives in the deepest modal
// and must sit above ALL three.
// ---------------------------------------------------------------------------
const DeepestModal = ({ close }: { close: () => void }) => {
  const actions: ActionCardActionProps[] = [
    { label: 'Primary', cta: () => {}, type: 'primary' },
    { label: 'Secondary Deep A', cta: () => {}, type: 'secondary' },
  ];
  return (
    <Modal>
      <ModalHeader closeFn={close}>Deepest Modal (pop)</ModalHeader>
      <div style={{ padding: '20px', minWidth: '400px' }}>
        <ActionCard actions={actions}>
          <ActionCardHeader actions={actions}>
            <span>Deepest card</span>
          </ActionCardHeader>
          <div>Click the meatballs.</div>
        </ActionCard>
      </div>
    </Modal>
  );
};

const MidModal = () => {
  const openDeepest = () => {
    ModalService.open(<DeepestModal close={() => ModalService.closeAllModals()} />, { animation: 'pop' });
  };
  return (
    <Modal>
      <ModalHeader closeFn={() => ModalService.closeAllModals()}>Mid Modal (slide)</ModalHeader>
      <div style={{ padding: '20px' }}>
        <Button onClick={openDeepest}>Open Deepest Modal</Button>
      </div>
    </Modal>
  );
};

const ShallowModal = () => {
  const openMid = () => {
    ModalService.open(<MidModal />, { animation: 'slide' });
  };
  return (
    <Modal>
      <ModalHeader closeFn={() => ModalService.closeAllModals()}>Shallow Modal (grow)</ModalHeader>
      <div style={{ padding: '20px' }}>
        <Button onClick={openMid}>Open Mid Modal</Button>
      </div>
    </Modal>
  );
};

export const PopoverAboveThreeDeepStack: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    await closeAllModals();
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /open shallow modal/i }));
    await new Promise((resolve) => setTimeout(resolve, 350));
    await userEvent.click(await screen.findByRole('button', { name: /open mid modal/i }));
    await new Promise((resolve) => setTimeout(resolve, 500));
    await userEvent.click(await screen.findByRole('button', { name: /open deepest modal/i }));
    await new Promise((resolve) => setTimeout(resolve, 350));

    await expect(screen.getByText('Deepest Modal (pop)')).toBeInTheDocument();

    const meatballsBtn = screen.getByTestId('action-card-header-open-menu-cta');
    await userEvent.click(meatballsBtn);
    await new Promise((resolve) => setTimeout(resolve, 350));

    const { popoverRoot, topEl } = await hitTestPopover('Secondary Deep A');
    await expect(popoverRoot.contains(topEl)).toBe(true);

    await closeAllModals();
  },
  render: () => {
    const open = () => {
      ModalService.open(<ShallowModal />, { animation: 'grow' });
    };
    return <Button onClick={open}>Open Shallow Modal</Button>;
  },
};

// ---------------------------------------------------------------------------
// Open popover in modal A, then open modal B over it. The newer modal must
// sit ABOVE the stale popover (popover z was frozen at open-time).
// ---------------------------------------------------------------------------
const PopoverHostModal = ({ openOverlay }: { openOverlay: () => void }) => {
  const actions: ActionCardActionProps[] = [
    { label: 'Primary Host', cta: () => {}, type: 'primary' },
    { label: 'Secondary Host A', cta: () => {}, type: 'secondary' },
  ];
  return (
    <Modal>
      <ModalHeader closeFn={() => ModalService.closeAllModals()}>Host Modal</ModalHeader>
      <div style={{ padding: '20px', minWidth: '400px' }}>
        <ActionCard actions={actions}>
          <ActionCardHeader actions={actions}>
            <span>Host card</span>
          </ActionCardHeader>
          <div>Popover host.</div>
        </ActionCard>
        <Button onClick={openOverlay}>Open Overlay Modal</Button>
      </div>
    </Modal>
  );
};

const OverlayModal = ({ close }: { close: () => void }) => {
  return (
    <Modal>
      <ModalHeader closeFn={close}>Overlay Modal</ModalHeader>
      <div
        style={{ padding: '80px', fontSize: '28px', minWidth: '720px', minHeight: '480px' }}
        data-testid="overlay-body"
      >
        I should cover the popover.
      </div>
    </Modal>
  );
};

export const NewModalCoversStalePopover: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    await closeAllModals();
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /open host modal/i }));
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Open popover inside host modal
    const meatballsBtn = screen.getByTestId('action-card-header-open-menu-cta');
    await userEvent.click(meatballsBtn);
    await new Promise((resolve) => setTimeout(resolve, 350));
    await expect(screen.getByText('Secondary Host A')).toBeVisible();

    // Now open a new modal on top while popover is still open
    await userEvent.click(await screen.findByRole('button', { name: /open overlay modal/i }));
    // Slide-in needs more time than grow; wait for transition to settle before hit-testing.
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Hit-test at the popover's own coordinates — viewport center could land on the overlay
    // even while the popover visually covers the popover's actual position.
    const overlay = screen.getByTestId('overlay-body');
    const overlayRoot = overlay.closest('.modalRoot') as HTMLElement;
    await expect(overlayRoot).toBeTruthy();

    const popoverItem = screen.getByText('Secondary Host A');
    const rect = popoverItem.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const topEl = document.elementFromPoint(cx, cy) as HTMLElement | null;
    await expect(topEl).toBeTruthy();
    // Topmost element under the popover's coords must belong to the overlay modal —
    // i.e. the popover is NOT still painting above the new modal.
    await expect(overlayRoot.contains(topEl)).toBe(true);

    await closeAllModals();
  },
  render: () => {
    const openHost = () => {
      const openOverlay = () => {
        ModalService.open(<OverlayModal close={() => {}} />, { animation: 'slide' });
      };
      ModalService.open(<PopoverHostModal openOverlay={openOverlay} />, { animation: 'grow' });
    };
    return <Button onClick={openHost}>Open Host Modal</Button>;
  },
};
