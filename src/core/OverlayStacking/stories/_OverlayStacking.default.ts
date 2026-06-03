import { StoryObj } from '@storybook/react';
import { DrawerService } from '@vanguard/Drawer/DrawerService';
import { ModalService } from '@vanguard/Modal/ModalService';

export type Story = StoryObj<any>;

/**
 * Tear down every overlay surface — drawer + tracked modals + ad-hoc modals.
 * Used before/after each play test so stories don't leak state into each other.
 */
export const closeAllOverlays = async () => {
  ModalService.closeLoadingModal();
  ModalService.closeConfirmModal();
  ModalService.closeErrorModal();
  ModalService.closeAllModals();
  DrawerService.closeLast();
  await new Promise((r) => setTimeout(r, 350));
};

/**
 * Locate the MUI Drawer root element. The Drawer mounts under a portal so we
 * cannot scope to the story canvas — we resolve it from `document` instead.
 */
export const getDrawerLayer = () =>
  (document.querySelector('.MuiDrawer-root') as HTMLElement | null) ??
  (document.querySelector('[role="presentation"].MuiModal-root') as HTMLElement | null);

export const readZ = (el: HTMLElement) => {
  const z = getComputedStyle(el).zIndex;
  return z && z !== 'auto' ? parseInt(z, 10) : NaN;
};

/** Pick whichever element paints at the centre of `el`'s bounding rect. */
export const topmostElAt = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) as HTMLElement | null;
};
