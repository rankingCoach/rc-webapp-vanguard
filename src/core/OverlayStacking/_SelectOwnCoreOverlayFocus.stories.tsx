import { baseStore } from '@stores/redux-base.store';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { Button } from '@vanguard/Button/Button';
import { DrawerRoot } from '@vanguard/Drawer/DrawerRoot/DrawerRoot';
import { DrawerService } from '@vanguard/Drawer/DrawerService';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { Select } from '@vanguard/Select/Select';
import React from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { closeAllOverlays, Story } from './stories/_OverlayStacking.default';

/**
 * Mixed overlays while both systems coexist (watchdog condition for ModalHost): the own-core Select menu opened from
 * Vanguard's own Modal and from the MUI-based Drawer keeps focus in the listbox, returns focus to the trigger on close
 * and leaves the outer overlay's body scroll lock in place.
 */
export default {
  ...SbDecorator({
    title: 'Vanguard/OverlayStacking/Own Core Select Focus',
    component: Modal,
    opts: { customStore: baseStore },
  }),
};

const options = [
  { key: 1, value: 'lon', title: 'London' },
  { key: 2, value: 'ber', title: 'Berlin' },
  { key: 3, value: 'par', title: 'Paris' },
];

const openAndNavigate = async (combobox: HTMLElement) => {
  combobox.focus();
  await userEvent.keyboard('{ArrowDown}');
  const listbox = await screen.findByRole('listbox');
  const items = within(listbox).getAllByRole('option');
  await waitFor(() => expect(items[0]).toHaveFocus());
  await userEvent.keyboard('{ArrowDown}');
  await expect(items[1]).toHaveFocus();
  // focus must stay in the menu (an outer focus trap must not pull it back)
  await new Promise((r) => setTimeout(r, 300));
  await expect(items[1]).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  await waitFor(() => expect(combobox).toHaveFocus());
};

export const ModalThenSelect: Story = {
  render: () => (
    <Button
      onClick={() =>
        ModalService.open(
          <Modal>
            <ModalHeader closeFn={() => ModalService.closeAllModals()}>{'Select Modal'}</ModalHeader>
            <div data-testid="modal-body" style={{ padding: 40, minWidth: 480 }}>
              <Select label="City" options={options} value="lon" translateOptions={false} />
            </div>
          </Modal>,
          { animation: 'pop' },
        )
      }
    >
      {'Open Modal'}
    </Button>
  ),
  play: async ({ canvasElement }) => {
    await closeAllOverlays();
    await userEvent.click(within(canvasElement).getByRole('button', { name: /open modal/i }));
    const body = await screen.findByTestId('modal-body');
    await new Promise((r) => setTimeout(r, 350));
    await expect(document.body.style.overflow).toBe('hidden');
    await openAndNavigate(within(body).getByRole('combobox', { hidden: true }));
    // the modal is still open: its body scroll lock must still be held after the menu released its own
    await expect(document.body.style.overflow).toBe('hidden');
    await closeAllOverlays();
  },
};

export const DrawerThenSelect: Story = {
  render: () => (
    <>
      <DrawerRoot />
      <Button
        onClick={() =>
          DrawerService.open(
            <div data-testid="drawer-body" style={{ width: 360, padding: 24 }}>
              <Select label="City" options={options} value="lon" translateOptions={false} />
            </div>,
          )
        }
      >
        {'Open Drawer'}
      </Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    await closeAllOverlays();
    await userEvent.click(within(canvasElement).getByRole('button', { name: /open drawer/i }));
    const body = await screen.findByTestId('drawer-body');
    await new Promise((r) => setTimeout(r, 350));
    const lockBefore = document.body.style.overflow;
    await openAndNavigate(within(body).getByRole('combobox', { hidden: true }));
    await expect(document.body.style.overflow).toBe(lockBefore);
    await closeAllOverlays();
  },
};
