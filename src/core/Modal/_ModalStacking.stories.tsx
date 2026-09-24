import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { BigAssEditModal } from '@vanguard/CustomModals/BigAssEditModal/BigAssEditModal';
import React, { useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Modal } from './Modal';
import { StandardModalProps } from './ModalRoot/ModalRoot';
import { ModalService } from './ModalService';

const Editor = ({ title, close, compact, expand }: StandardModalProps<unknown>) => {
  const [draft, setDraft] = useState('');
  return (
    <BigAssEditModal title={title!} description="Switch between your open work without losing changes."
      testId={`stack-${title}`} close={close} savable={false} savingInProgress={false}
      saveCallback={() => {}} cancelCallback={() => {}}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingBottom: 24 }}>
        <button onClick={compact ?? (() => ModalService.setCompactMode(true))}>Compact all BAMs</button>
        <button onClick={expand ?? (() => ModalService.setCompactMode(false))}>Expand all BAMs</button>
        <button onClick={() => openEditor('New window')}>Open another BAM</button>
        <button onClick={() => ModalService.setStackingEnabled(false)}>Disable stacking</button>
      </div>
      <label>Draft for {title}<input aria-label={`Draft for ${title}`} value={draft} onChange={(e) => setDraft(e.target.value)} /></label>
      <div style={{ height: 900, paddingTop: 32 }}>Your {title} content stays mounted.</div>
    </BigAssEditModal>
  );
};

const openEditor = (title: string, allowCompact = true) => ModalService.open(
  <Editor title={title} close={() => {}} />, { allowCompact, stackTitle: title },
);

const Demo = ({ compact = false }: { compact?: boolean }) => {
  useEffect(() => () => {
    ModalService.setCompactMode(false);
    ModalService.setStackingEnabled(false);
    ModalService.closeAllModals();
  }, []);
  return <div style={{ minHeight: '150vh', padding: 24 }}>
    <button onClick={() => {
      ModalService.setStackingEnabled(true);
      ModalService.setCompactMode(compact);
      openEditor('Business profile', false);
      openEditor('Website');
      openEditor('Assistant');
    }}>Open three BAMs</button>
    <p>Hover an exposed rear edge, then click its label to bring that window forward.</p>
  </div>;
};

const exerciseStack = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Open three BAMs' }));
  const assistant = await canvas.findByTestId('stack-Assistant');
  const profile = await canvas.findByTestId('stack-Business profile');
  const root = (el: HTMLElement) => el.closest('.modalRoot') as HTMLElement;
  const panel = (el: HTMLElement) => el.querySelector('.modal-content') as HTMLElement;
  await waitFor(() => expect(root(assistant)).toHaveAttribute('data-stack-active', 'true'));
  await expect(root(profile).querySelector('.modalRoot-container')).toHaveAttribute('inert');
  await userEvent.type(within(assistant).getByRole('textbox'), 'Keep this draft');
  const backTab = canvas.getByRole('button', { name: 'Bring to front Business profile' });
  await waitFor(() => expect(getComputedStyle(root(profile).querySelector('.modalRoot-container')!).transform).toBe('none'));
  const originalTop = panel(profile).getBoundingClientRect().top;
  await userEvent.hover(backTab);
  // Keyboard focus exercises the same lift/reveal rule in both native browser tests
  // and the Storybook play runner, whose synthetic hover does not set CSS :hover.
  backTab.focus();
  await waitFor(() => expect(panel(profile).getBoundingClientRect().top).toBeLessThan(originalTop - 5));
  await userEvent.click(backTab);
  await waitFor(() => expect(root(profile)).toHaveAttribute('data-stack-active', 'true'));
  await expect(root(assistant).querySelector('.modalRoot-container')).toHaveAttribute('inert');
  await userEvent.click(canvas.getByRole('button', { name: 'Bring to front Assistant' }));
  await waitFor(() => expect(root(assistant)).toHaveAttribute('data-stack-active', 'true'));
  await expect(within(assistant).getByRole('textbox')).toHaveValue('Keep this draft');
  await userEvent.click(within(assistant).getByRole('button', { name: 'Compact all BAMs' }));
  await waitFor(() => {
    for (const modal of canvasElement.querySelectorAll('.rc-modal')) expect(modal).toHaveClass('modal-compact');
  });
  await expect(canvasElement.ownerDocument.body.style.overflow).toBe('');
  await userEvent.click(within(assistant).getByRole('button', { name: 'Open another BAM' }));
  const added = await canvas.findByTestId('stack-New window');
  await waitFor(() => expect(added).toHaveClass('modal-compact'));
  await expect(root(added)).toHaveAttribute('data-stack-active', 'true');
  await userEvent.click(within(added).getByRole('button', { name: 'Expand all BAMs' }));
  await waitFor(() => {
    for (const modal of canvasElement.querySelectorAll('.rc-modal')) expect(modal).not.toHaveClass('modal-compact');
  });
  await userEvent.click(within(added).getByRole('button', { name: 'Disable stacking' }));
  await waitFor(() => expect(canvasElement.querySelector('.modalRoot-stacked')).toBeNull());
  ModalService.closeAllModals();
  await waitFor(() => expect(canvas.queryByTestId('stack-New window')).not.toBeInTheDocument());
};

export const FullscreenStack = { render: () => <Demo />, play: exerciseStack };
export const CompactStack = { render: () => <Demo compact />, play: exerciseStack };
export const Playground = { render: () => <Demo /> };

export default { ...SbDecorator({ title: 'vanguard/ModalStacking', component: Modal }) };
