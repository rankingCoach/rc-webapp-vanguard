import { Button } from '@vanguard/Button/Button';
import { Modal } from '@vanguard/Modal/Modal';
import { StandardModalProps } from '@vanguard/Modal/ModalRoot/ModalRoot';
import { ModalService } from '@vanguard/Modal/ModalService';
import React, { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { BigAssEditModal } from '../BigAssEditModal';
import { Story } from './_BigAssEditModal.default';

const onClose = fn();

const CompactEditor = ({ close, compact, expand }: StandardModalProps<unknown>) => {
  const [draft, setDraft] = useState('');
  return (
    <BigAssEditModal
      testId="compact-editor"
      title="Compact editor"
      description="Keep editing while using the page behind this panel."
      close={close}
      savable={false}
      savingInProgress={false}
      saveCallback={() => {}}
      cancelCallback={() => {}}
    >
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {compact && <Button onClick={compact}>Compact</Button>}
        {expand && <Button onClick={expand}>Expand</Button>}
      </div>
      <label>
        Draft
        <input aria-label="Draft" value={draft} onChange={(event) => setDraft(event.target.value)} />
      </label>
      <div style={{ height: 900, paddingTop: 24 }}>Scrollable editor content</div>
    </BigAssEditModal>
  );
};

const BlockingSibling = ({ close }: StandardModalProps<unknown>) => (
  <Modal fullscreen={false} onClose={close} testId="compact-sibling"><span>Blocking sibling</span></Modal>
);

const Demo = ({ allowCompact = true }: { allowCompact?: boolean }) => {
  const [id, setId] = useState<string>();
  const [clicks, setClicks] = useState(0);
  return (
    <div style={{ minHeight: '150vh' }}>
      <Button onClick={() => setId(ModalService.open(<CompactEditor close={onClose} />, { allowCompact }))}>
        Open editor
      </Button>
      <Button onClick={() => setClicks((value) => value + 1)}>{`Background clicks: ${clicks}`}</Button>
      <Button onClick={() => ModalService.compactEv(id)}>Compact by ID</Button>
      <Button onClick={() => ModalService.expandEv(id)}>Expand by ID</Button>
      <Button onClick={() => ModalService.closeEv(id)}>Close by ID</Button>
      <Button onClick={() => ModalService.open(<BlockingSibling close={() => {}} />)}>Open blocking sibling</Button>
    </div>
  );
};

export const CompactMode: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    ModalService.closeAllModals();
    await waitFor(() => expect(canvas.queryByTestId('compact-editor')).not.toBeInTheDocument());
    onClose.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: 'Open editor' }));
    const modal = await canvas.findByTestId('compact-editor');
    const editor = within(modal);
    const panel = modal.querySelector('.modal-content') as HTMLElement;
    const body = canvasElement.ownerDocument.body;
    await userEvent.type(editor.getByRole('textbox', { name: 'Draft' }), 'Preserved draft');
    await expect(body.style.overflow).toBe('hidden');
    await userEvent.click(editor.getByRole('button', { name: 'Compact' }));
    await waitFor(() => expect(modal).toHaveClass('modal-compact'));
    await waitFor(() => expect(panel.getBoundingClientRect().width).toBeLessThanOrEqual(481));
    await expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth);
    await expect(body.style.overflow).toBe('');
    await expect(onClose).not.toHaveBeenCalled();
    await expect(editor.getByRole('textbox')).toHaveValue('Preserved draft');
    const footer = modal.querySelector('.modal-footer') as HTMLElement;
    await waitFor(() => expect(footer.getBoundingClientRect().right).toBeLessThanOrEqual(panel.getBoundingClientRect().right + 1));
    await userEvent.click(canvas.getByRole('button', { name: 'Background clicks: 0' }));
    await expect(canvas.getByRole('button', { name: 'Background clicks: 1' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Open blocking sibling' }));
    await waitFor(() => expect(body.style.overflow).toBe('hidden'));
    await userEvent.click(within(await canvas.findByTestId('compact-sibling')).getByTestId('modal-close-cta'));
    await waitFor(() => expect(canvas.queryByTestId('compact-sibling')).not.toBeInTheDocument());
    await waitFor(() => expect(body.style.overflow).toBe(''));
    await userEvent.click(editor.getByRole('button', { name: 'Expand' }));
    await waitFor(() => expect(modal).not.toHaveClass('modal-compact'));
    await expect(body.style.overflow).toBe('hidden');
    await expect(editor.getByRole('textbox')).toHaveValue('Preserved draft');
    await userEvent.click(editor.getByRole('button', { name: 'Compact' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Expand by ID' }));
    await waitFor(() => expect(modal).not.toHaveClass('modal-compact'));
    await userEvent.click(editor.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(canvas.queryByTestId('compact-editor')).not.toBeInTheDocument());
    await expect(onClose).toHaveBeenCalledTimes(1);
    await expect(onClose).toHaveBeenCalledWith({ isOk: false });
    await expect(body.style.overflow).toBe('');
  },
};

export const CompactModeNotEnabled: Story = {
  render: () => <Demo allowCompact={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open editor' }));
    const modal = await canvas.findByTestId('compact-editor');
    await expect(within(modal).queryByRole('button', { name: 'Compact' })).not.toBeInTheDocument();
    const storedModal = Array.from(canvasElement.querySelectorAll('.modalRoot'))[0];
    await expect(storedModal).not.toHaveClass('modalRoot-compact');
    await expect(modal).not.toHaveClass('modal-compact-enabled');
    await userEvent.click(within(modal).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(canvas.queryByTestId('compact-editor')).not.toBeInTheDocument());
  },
};
