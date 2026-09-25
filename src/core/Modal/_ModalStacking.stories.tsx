import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { BigAssEditModal } from '@vanguard/CustomModals/BigAssEditModal/BigAssEditModal';
import React, { useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Modal } from './Modal';
import { StandardModalProps } from './ModalRoot/ModalRoot';
import { ModalService } from './ModalService';

const Editor = ({ title, close, compact, expand }: StandardModalProps<unknown>) => {
  const [draft, setDraft] = useState('');
  const [actionCount, setActionCount] = useState(0);
  return (
    <BigAssEditModal title={title!} description="Switch between your open work without losing changes."
      testId={`stack-${title}`} close={close} savable={false} savingInProgress={false}
      saveCallback={() => {}} cancelCallback={() => {}}>
      {ModalService.isCompactWindowControlsEnabled() && <button aria-label={`Window action ${actionCount}`}
        style={{ position: 'absolute', top: 12, right: 16, zIndex: 1 }} onClick={() => setActionCount((count) => count + 1)}>⋯</button>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingBottom: 24 }}>
        <button onClick={compact ?? (() => ModalService.setCompactMode(true))}>Compact all BAMs</button>
        <button onClick={expand ?? (() => ModalService.setCompactMode(false))}>Expand all BAMs</button>
        <button onClick={() => openEditor('New window')}>Open another BAM</button>
        <button onClick={() => ModalService.setStackingEnabled(false)}>Disable stacking</button>
      </div>
      <button onClick={() => ModalService.setCompactWindowControlsEnabled(false)}>Disable moving and resizing</button>
      <label>Draft for {title}<input aria-label={`Draft for ${title}`} value={draft} onChange={(e) => setDraft(e.target.value)} /></label>
      <div style={{ height: 900, paddingTop: 32 }}>Your {title} content stays mounted.</div>
    </BigAssEditModal>
  );
};

const openEditor = (title: string, allowCompact = true) => ModalService.open(
  <Editor title={title} close={() => {}} />, { allowCompact, stackTitle: title },
);

const Demo = ({ compact = false, windowControls = false, maxStackSize }: { compact?: boolean; windowControls?: boolean; maxStackSize?: number }) => {
  useEffect(() => () => {
    ModalService.setMaxStackSize();
    ModalService.setCompactWindowControlsEnabled(false);
    ModalService.setCompactMode(false);
    ModalService.setStackingEnabled(false);
    ModalService.closeAllModals();
  }, []);
  return <div style={{ minHeight: '150vh', padding: 24 }}>
    <button onClick={() => {
      ModalService.setMaxStackSize(maxStackSize);
      ModalService.setCompactWindowControlsEnabled(windowControls);
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
  if (!profile.classList.contains('modal-compact')) {
    // Expanded reordering must not interpolate layout properties on a full editor.
    expect(getComputedStyle(panel(profile)).transitionProperty).toBe('transform');
    expect(getComputedStyle(backTab).transitionProperty).toBe('transform');
  }
  const originalTop = panel(profile).getBoundingClientRect().top;
  await userEvent.hover(backTab);
  // Keyboard focus exercises the same lift/reveal rule in both native browser tests
  // and the Storybook play runner, whose synthetic hover does not set CSS :hover.
  backTab.focus();
  await waitFor(() => expect(panel(profile).getBoundingClientRect().top).toBeLessThan(originalTop - 5));
  await userEvent.click(backTab);
  await waitFor(() => expect(root(profile)).toHaveAttribute('data-stack-active', 'true'));
  if (!profile.classList.contains('modal-compact')) {
    await waitFor(() => expect(Math.abs(panel(profile).getBoundingClientRect().bottom - window.innerHeight)).toBeLessThan(1));
    expect(panel(profile).getBoundingClientRect().left).toBe(0);
    expect(panel(profile).getBoundingClientRect().width).toBe(window.innerWidth);
  }
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
export const FullscreenTabs = { render: () => <Demo />, play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Open three BAMs' }));
  const assistant = await canvas.findByTestId('stack-Assistant');
  expect(canvas.queryByRole('tablist')).toBeNull();
  await userEvent.type(within(assistant).getByRole('textbox'), 'Preserved across tabs');
  await userEvent.click(within(assistant).getByRole('button', { name: 'Open another BAM' }));
  const tabs = await canvas.findByRole('tablist', { name: 'Open windows' });
  const labels = () => within(tabs).getAllByRole('tab').map((tab) => tab.textContent);
  const order = labels();
  expect(order).toEqual(['Business profile', 'Website', 'Assistant', 'New window']);
  expect(canvas.queryByRole('button', { name: /Bring to front/ })).toBeNull();
  await userEvent.click(within(tabs).getByRole('tab', { name: 'Assistant' }));
  expect(within(assistant).getByRole('textbox')).toHaveValue('Preserved across tabs');
  expect(labels()).toEqual(order);
  await userEvent.keyboard('{Home}');
  expect(within(tabs).getByRole('tab', { name: 'Business profile' })).toHaveAttribute('aria-selected', 'true');
  await userEvent.keyboard('{End}');
  expect(within(tabs).getByRole('tab', { name: 'New window' })).toHaveAttribute('aria-selected', 'true');
  const added = canvas.getByTestId('stack-New window');
  await waitFor(() => {
    const rect = added.querySelector('.modal-content')!.getBoundingClientRect();
    expect(rect.top).toBe(48);
    expect(rect.bottom).toBe(window.innerHeight);
    expect(rect.width).toBe(window.innerWidth);
  });
  await userEvent.click(within(added).getByRole('button', { name: 'Compact all BAMs' }));
  expect(canvas.queryByRole('tablist')).toBeNull();
  await userEvent.click(within(added).getByRole('button', { name: 'Expand all BAMs' }));
  expect(canvas.getAllByRole('tab')).toHaveLength(4);
  await userEvent.click(within(added).getByRole('button', { name: 'Cancel', exact: true }));
  await waitFor(() => expect(canvas.queryByRole('tablist')).toBeNull());
  expect(canvas.getAllByRole('button', { name: /Bring to front/ })).toHaveLength(2);
  ModalService.closeAllModals();
} };
export const CompactStack = { render: () => <Demo compact />, play: exerciseStack };
export const MovableCompactWindows = { render: () => <Demo compact windowControls />, play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Open three BAMs' }));
  const assistant = await canvas.findByTestId('stack-Assistant');
  const root = assistant.closest('.modalRoot')!;
  const id = root.getAttribute('data-modal-id')!;
  await userEvent.type(within(assistant).getByRole('textbox'), 'Preserved floating draft');
  await expect(canvas.queryByRole('button', { name: 'Stack all', exact: true })).toBeNull();
  await expect(canvas.queryByRole('button', { name: 'Return to stack', exact: true })).toBeNull();
  const handle = canvas.getByRole('button', { name: 'Move Assistant', exact: true });
  handle.focus();
  await expect(getComputedStyle(handle).cursor).toBe('move');
  await expect(getComputedStyle(handle).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  await expect(handle.querySelector('svg')).toBeNull();
  await waitFor(() => expect(getComputedStyle(root.querySelector('.modalRoot-container')!).transform).toBe('none'));
  const start = assistant.querySelector('.modal-content')!.getBoundingClientRect();
  await userEvent.pointer([
    { keys: '[MouseLeft>]', target: assistant.querySelector('.modal-content')!, coords: { clientX: start.left + 24, clientY: start.top + 24 } },
    { target: assistant.querySelector('.modal-content')!, coords: { clientX: start.left - 376, clientY: start.top + 44 } },
    { keys: '[/MouseLeft]', target: assistant.querySelector('.modal-content')!, coords: { clientX: start.left - 376, clientY: start.top + 44 } },
  ]);
  await waitFor(() => expect(ModalService.isCompactWindowDetached(id)).toBe(true));
  await expect(root).not.toHaveClass('modalRoot-stacked');
  const before = ModalService.getCompactWindowBounds(id)!;
  await waitFor(() => {
    const rect = assistant.querySelector('.modal-content')!.getBoundingClientRect();
    expect(Math.abs(rect.left - before.x)).toBeLessThan(1);
    expect(Math.abs(rect.top - before.y)).toBeLessThan(1);
    expect(rect.right).toBeLessThanOrEqual(window.innerWidth + 1);
    expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight + 1);
  });
  const resize = within(root as HTMLElement).getByRole('button', { name: 'Resize Assistant bottom right' });
  resize.focus();
  await userEvent.keyboard('{ArrowRight}');
  await waitFor(() => expect(ModalService.getCompactWindowBounds(id)!.width).toBeGreaterThan(before.width));
  // Drop the detached window back onto the attached stack, with a visible target hint.
  const detached = assistant.querySelector('.modal-content')!.getBoundingClientRect();
  await userEvent.pointer([
    { keys: '[MouseLeft>]', target: assistant.querySelector('.modal-content')!, coords: { clientX: detached.left + 24, clientY: detached.top + 24 } },
    { target: assistant.querySelector('.modal-content')!, coords: { clientX: start.left + 24, clientY: start.top + 24 } },
    { keys: '[/MouseLeft]', target: assistant.querySelector('.modal-content')!, coords: { clientX: start.left + 24, clientY: start.top + 24 } },
  ]);
  await waitFor(() => expect(root).toHaveClass('modalRoot-stacked'));
  await expect(within(assistant).getByRole('textbox')).toHaveValue('Preserved floating draft');
  const sharedResize = within(root as HTMLElement).getByRole('button', { name: 'Resize Assistant bottom right' });
  sharedResize.focus();
  await userEvent.keyboard('{ArrowLeft}');
  await waitFor(() => expect(ModalService.getCompactStackBounds()).toBeDefined());
  await userEvent.click(within(assistant).getByRole('button', { name: 'Disable moving and resizing' }));
  await waitFor(() => expect(canvasElement.querySelector('.compact-window-controls')).toBeNull());
  await expect(root).not.toHaveClass('modalRoot-window-controls');
  ModalService.closeAllModals();
} };
export const DragControlsStayAligned = { render: () => <Demo compact windowControls />, play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const pointer = userEvent.setup();
  await pointer.click(canvas.getByRole('button', { name: 'Open three BAMs' }));
  const assistant = await canvas.findByTestId('stack-Assistant');
  const root = assistant.closest('.modalRoot') as HTMLElement;
  const controls = root.querySelector('.compact-window-controls') as HTMLElement;
  const panel = assistant.querySelector('.modal-content') as HTMLElement;
  await waitFor(() => expect(getComputedStyle(root.querySelector('.modalRoot-container')!).transform).toBe('none'));
  const handle = within(root).getByRole('button', { name: 'Move Assistant', exact: true });
  const before = panel.getBoundingClientRect();
  const start = before;
  await pointer.pointer({ keys: '[MouseLeft>]', target: assistant.querySelector('.modal-content')!, coords: { clientX: start.left + 24, clientY: start.top + 24 } });
  await waitFor(() => {
    expect(getComputedStyle(controls).transitionDuration).toBe('0s');
    expect(getComputedStyle(panel).transitionDuration).toBe('0s');
  });
  await pointer.pointer({ target: assistant.querySelector('.modal-content')!, coords: { clientX: start.left - 376, clientY: start.top + 34 } });
  await waitFor(() => {
    const windowRect = panel.getBoundingClientRect();
    const controlsRect = controls.getBoundingClientRect();
    expect(windowRect.left).toBeLessThan(before.left - 100);
    expect(Math.abs(windowRect.left - controlsRect.left)).toBeLessThan(1);
    expect(Math.abs(windowRect.top - controlsRect.top)).toBeLessThan(1);
  });
  await pointer.pointer({ target: assistant.querySelector('.modal-content')!, coords: { clientX: start.left + 14, clientY: start.top + 24 } });
  await waitFor(() => {
    expect(canvasElement.querySelector('.modalRoot-drop-target')).not.toBeNull();
    const target = canvasElement.querySelector('.modalRoot-drop-target')!;
    const preview = target.querySelector('.compact-window-drop-preview')!;
    expect(getComputedStyle(preview).display).toBe('block');
    expect(preview).toBeEmptyDOMElement();
    expect(canvas.queryByText('Release to stack')).toBeNull();
    expect(getComputedStyle(preview).pointerEvents).toBe('none');
    const panel = target.querySelector('.modal-content')!;
    expect(parseFloat(getComputedStyle(panel).translate.split(' ')[1])).toBeLessThan(-5);
  });
  await pointer.pointer({ keys: '[/MouseLeft]', target: assistant.querySelector('.modal-content')! });
  await waitFor(() => expect(canvasElement.querySelector('.modalRoot-drop-target')).toBeNull());
  ModalService.closeAllModals();
} };

export const TitleBandWithActions = { render: () => <Demo compact windowControls />, play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const pointer = userEvent.setup();
  await pointer.click(canvas.getByRole('button', { name: 'Open three BAMs' }));
  const assistant = await canvas.findByTestId('stack-Assistant');
  const root = assistant.closest('.modalRoot')!;
  const id = root.getAttribute('data-modal-id')!;
  const panel = assistant.querySelector('.modal-content')!;
  await waitFor(() => expect(getComputedStyle(root.querySelector('.modalRoot-container')!).transform).toBe('none'));
  const rect = panel.getBoundingClientRect();
  const action = within(assistant).getByRole('button', { name: 'Window action 0' });
  expect(action.getBoundingClientRect().top).toBeLessThan(rect.top + 48);
  await pointer.pointer({ target: panel, coords: { clientX: rect.left + 24, clientY: rect.top + 24 } });
  expect(root).toHaveClass('modalRoot-move-highlight');
  expect(canvasElement.querySelectorAll('.modalRoot-move-highlight')).toHaveLength(1);
  await pointer.pointer({ target: panel, coords: { clientX: rect.left + rect.width / 2, clientY: rect.top + 24 } });
  expect(canvasElement.querySelectorAll('.modalRoot-move-highlight')).toHaveLength(3);
  await pointer.pointer({ target: action });
  expect(canvasElement.querySelectorAll('.modalRoot-move-highlight')).toHaveLength(0);
  await pointer.click(action);
  await expect(within(assistant).getByRole('button', { name: 'Window action 1' })).toBeInTheDocument();
  expect(ModalService.isCompactWindowInteracting()).toBe(false);
  expect(ModalService.isCompactWindowDetached(id)).toBe(false);
  const center = rect.left + rect.width / 2;
  await pointer.pointer([
    { keys: '[MouseLeft>]', target: panel, coords: { clientX: center, clientY: rect.top + 24 } },
    { target: panel, coords: { clientX: center - 160, clientY: rect.top + 24 } },
    { keys: '[/MouseLeft]', target: panel, coords: { clientX: center - 160, clientY: rect.top + 24 } },
  ]);
  await waitFor(() => expect(ModalService.getCompactStackBounds()!.x).toBeLessThan(rect.left - 100));
  expect(ModalService.isCompactWindowDetached(id)).toBe(false);
  expect(ModalService.getStackedBamIds()).toHaveLength(3);
  ModalService.closeAllModals();
} };

export const DragFromMiddleOfStack = { render: () => <Demo compact windowControls />, play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const pointer = userEvent.setup();
  await pointer.click(canvas.getByRole('button', { name: 'Open three BAMs' }));
  const website = await canvas.findByTestId('stack-Website');
  const root = website.closest('.modalRoot')!;
  const id = root.getAttribute('data-modal-id')!;
  const tab = canvas.getByRole('button', { name: 'Bring to front Website' });
  await waitFor(() => expect(getComputedStyle(root.querySelector('.modalRoot-container')!).transform).toBe('none'));
  const rect = tab.getBoundingClientRect();
  const coords = { clientX: rect.left + 60, clientY: rect.top + 8 };
  await pointer.pointer({ keys: '[MouseLeft>]', target: tab, coords });
  expect(root).toHaveAttribute('data-stack-active', 'false');
  expect(ModalService.isCompactWindowDetached(id)).toBe(false);
  await pointer.pointer({ target: tab, coords: { clientX: coords.clientX - 400, clientY: coords.clientY + 20 } });
  await waitFor(() => expect(ModalService.isCompactWindowDetached(id)).toBe(true));
  // The strip disappears after detaching; pointer capture continues on the stable root.
  await pointer.pointer({ keys: '[/MouseLeft]', target: website.querySelector('.modal-content')! });
  expect(ModalService.getStackedBamIds()).toHaveLength(2);
  const back = canvas.getByRole('button', { name: 'Bring to front Business profile' });
  const profile = canvas.getByTestId('stack-Business profile').closest('.modalRoot')!;
  await pointer.pointer({ keys: '[MouseLeft>]', target: back });
  expect(profile).toHaveAttribute('data-stack-active', 'false');
  await pointer.pointer({ keys: '[/MouseLeft]', target: back });
  await waitFor(() => expect(profile).toHaveAttribute('data-stack-active', 'true'));
  expect(ModalService.isCompactWindowDetached(profile.getAttribute('data-modal-id')!)).toBe(false);
  ModalService.closeAllModals();
} };

export const LimitedStack = { render: () => <Demo compact windowControls maxStackSize={2} />, play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Open three BAMs' }));
  const assistant = await canvas.findByTestId('stack-Assistant');
  await waitFor(() => expect(canvas.queryByTestId('stack-Business profile')).not.toBeInTheDocument());
  await expect(canvas.getByTestId('stack-Website')).toBeInTheDocument();
  await userEvent.click(within(assistant).getByRole('button', { name: 'Open another BAM' }));
  await canvas.findByTestId('stack-New window');
  await waitFor(() => expect(canvas.queryByTestId('stack-Website')).not.toBeInTheDocument());
  await expect(assistant).toBeInTheDocument();
  expect(ModalService.getStackedBamIds()).toHaveLength(2);
  ModalService.setMaxStackSize();
  ModalService.closeAllModals();
} };

export const DropStackOntoWindow = { render: () => <Demo compact windowControls />, play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const pointer = userEvent.setup();
  await pointer.click(canvas.getByRole('button', { name: 'Open three BAMs' }));
  const assistant = await canvas.findByTestId('stack-Assistant');
  const website = canvas.getByTestId('stack-Website');
  const root = assistant.closest('.modalRoot')!;
  const id = root.getAttribute('data-modal-id')!;
  // Keyboard movement detaches one window, leaving a two-window stack to drag onto it.
  within(root as HTMLElement).getByRole('button', { name: 'Move Assistant', exact: true }).focus();
  await pointer.keyboard('{Shift>}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{/Shift}');
  await waitFor(() => expect(ModalService.isCompactWindowDetached(id)).toBe(true));
  const targetBounds = ModalService.getCompactWindowBounds(id)!;
  const panel = website.querySelector('.modal-content')!;
  await waitFor(() => expect(getComputedStyle(website.closest('.modalRoot')!.querySelector('.modalRoot-container')!).transform).toBe('none'));
  const start = panel.getBoundingClientRect();
  const center = start.left + start.width / 2;
  const dx = targetBounds.x - start.left;
  await pointer.pointer({ keys: '[MouseLeft>]', target: panel, coords: { clientX: center, clientY: start.top + 24 } });
  await pointer.pointer({ target: panel, coords: { clientX: center + dx, clientY: start.top + 24 } });
  await waitFor(() => expect(root).toHaveClass('modalRoot-drop-target'));
  await pointer.pointer({ keys: '[/MouseLeft]', target: panel });
  await waitFor(() => expect(ModalService.isCompactWindowDetached(id)).toBe(false));
  expect(ModalService.getStackedBamIds()).toHaveLength(3);
  expect(ModalService.getStackedBamIds().at(-1)).toBe(website.closest('.modalRoot')!.getAttribute('data-modal-id'));
  ModalService.closeAllModals();
} };

export const IndependentStacks = { render: () => <Demo compact windowControls />, play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const pointer = userEvent.setup();
  await pointer.click(canvas.getByRole('button', { name: 'Open three BAMs' }));
  const assistant = await canvas.findByTestId('stack-Assistant');
  await pointer.click(within(assistant).getByRole('button', { name: 'Open another BAM' }));
  const fourth = await canvas.findByTestId('stack-New window');
  const idOf = (element: HTMLElement) => element.closest('.modalRoot')!.getAttribute('data-modal-id')!;
  const panelOf = (element: HTMLElement) => element.querySelector('.modal-content')!;
  const pullLeft = async (element: HTMLElement, x: number) => {
    const root = element.closest('.modalRoot')!;
    await waitFor(() => expect(getComputedStyle(root.querySelector('.modalRoot-container')!).transform).toBe('none'));
    const panel = panelOf(element);
    const rect = panel.getBoundingClientRect();
    await pointer.pointer([
      { keys: '[MouseLeft>]', target: panel, coords: { clientX: rect.left + 30, clientY: rect.top + 24 } },
      { target: panel, coords: { clientX: x + 30, clientY: rect.top + 24 } },
      { keys: '[/MouseLeft]', target: panel, coords: { clientX: x + 30, clientY: rect.top + 24 } },
    ]);
  };
  await pullLeft(fourth, 40);
  await waitFor(() => expect(ModalService.isCompactWindowDetached(idOf(fourth))).toBe(true));
  await pullLeft(assistant, 60);
  const website = canvas.getByTestId('stack-Website');
  const profile = canvas.getByTestId('stack-Business profile');
  await waitFor(() => expect(ModalService.getStackedBamIds(idOf(assistant))).toEqual([idOf(fourth), idOf(assistant)]));
  expect(ModalService.getStackedBamIds(idOf(website))).toEqual([idOf(profile), idOf(website)]);
  expect(ModalService.getCompactStackBounds(idOf(assistant))!.x).toBeLessThan(100);
  await waitFor(() => expect(panelOf(website).getBoundingClientRect().left).toBeGreaterThan(500));
  await waitFor(() => expect(website.closest('.modalRoot')!.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running')).toHaveLength(0));
  const originalWidth = panelOf(website).getBoundingClientRect().width;
  const originalLeft = panelOf(website).getBoundingClientRect().left;
  const newRoot = assistant.closest('.modalRoot') as HTMLElement;
  within(newRoot).getByRole('button', { name: 'Move stack', exact: true }).focus();
  await pointer.keyboard('{ArrowRight}');
  const newBounds = ModalService.getCompactStackBounds(idOf(assistant))!;
  expect(newBounds.x).toBe(50);
  within(newRoot).getByRole('button', { name: 'Resize Assistant bottom right', exact: true }).focus();
  await pointer.keyboard('{ArrowLeft}');
  expect(ModalService.getCompactStackBounds(idOf(fourth))!.width).toBe(newBounds.width - 10);
  expect(panelOf(website).getBoundingClientRect().left).toBe(originalLeft);
  expect(panelOf(website).getBoundingClientRect().width).toBe(originalWidth);
  ModalService.closeAllModals();
} };

export const MovablePlayground = { render: () => <Demo compact windowControls /> };

export const Playground = { render: () => <Demo /> };

export default { ...SbDecorator({ title: 'vanguard/ModalStacking', component: Modal }) };
