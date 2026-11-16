/**
 * MUI upgrade contract (v5 -> v9) for AutocompleteWithAnchor (MUI Popper via PopoverPopper + ClickAwayListener
 * + vanguard Autocomplete).
 *
 * Locks the CURRENT observable behaviour on MUI v5 so that the unchanged tests go red where MUI changes
 * behaviour (see agentic-plans/mui-upgrade-breaking-changes.md). Real MUI, no mocks.
 *
 * No MUI class is asserted: the popper is located via `.vanguard-popover` (PopoverPopper.tsx:18, PopoverPopper.scss:2).
 * `data-popper-placement` is asserted as the observable placement.
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { render, screen, waitFor } from '../../../test-utils/test-utils';
import { AutocompleteWithAnchor, AutocompleteWithAnchorProps } from './AutocompleteWithAnchor';

const OPTIONS = ['Option 1', 'Option 2', 'Option 3'];

const renderAnchored = (props: Partial<AutocompleteWithAnchorProps> = {}) =>
  render(
    <div>
      <button type={'button'} data-testid={'outside'}>
        {'outside'}
      </button>
      <AutocompleteWithAnchor autocompleteProps={{ options: OPTIONS, testId: 'anchored-ac', label: 'Pick' }} {...props}>
        {props.children ?? (
          <button type={'button'} data-testid={'anchor'}>
            {'anchor'}
          </button>
        )}
      </AutocompleteWithAnchor>
    </div>,
  );

/** `.vanguard-popover` is the class PopoverPopper puts on the MUI Popper root. */
const getPopper = () => document.querySelector('.vanguard-popover') as HTMLElement | null;
const getAnchorWrapper = () => screen.getByTestId('anchor').parentElement as HTMLElement;

describe('AutocompleteWithAnchor MUI contract', () => {
  afterEach(() => {
    OverlayStackingService.__resetForTests();
    vi.restoreAllMocks();
  });

  test('renders nothing without children', () => {
    const { container } = render(
      <AutocompleteWithAnchor autocompleteProps={{ options: OPTIONS }}>{null}</AutocompleteWithAnchor>,
    );
    expect(container.innerHTML).toBe('');
  });

  test('closed: only the anchor is rendered, no popper and no autocomplete', () => {
    renderAnchored();
    expect(screen.getByTestId('anchor')).toBeInTheDocument();
    expect(getPopper()).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(getAnchorWrapper().parentElement).toHaveStyle({ cursor: 'pointer' });
  });

  test('onOpenChange(false) fires on mount', () => {
    const onOpenChange = vi.fn();
    renderAnchored({ onOpenChange });
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('clicking the anchor opens a body-portalled MUI Popper anchored to it with the Autocomplete inside', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    const { container } = renderAnchored({ onOpenChange });

    await user.click(screen.getByTestId('anchor'));

    const popper = getPopper() as HTMLElement;
    expect(popper).not.toBeNull();
    expect(popper.parentElement).toBe(document.body);
    expect(container.contains(popper)).toBe(false);
    // popper.js placement attribute (MUI Popper default placement)
    expect(popper).toHaveAttribute('data-popper-placement', 'bottom');
    expect(popper.querySelector('[data-testid="anchored-ac"]')).not.toBeNull();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  test('popper width follows the anchor element clientWidth', async () => {
    const user = userEvent.setup();
    renderAnchored();
    const wrapper = getAnchorWrapper();
    Object.defineProperty(wrapper, 'clientWidth', { configurable: true, value: 240 });
    await user.click(screen.getByTestId('anchor'));
    expect((getPopper() as HTMLElement).style.width).toBe('240px');
  });

  test('the autocomplete input receives focus after opening', async () => {
    const user = userEvent.setup();
    renderAnchored();
    await user.click(screen.getByTestId('anchor'));
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus());
  });

  test('open registers a popover slot used as inline popper z-index', async () => {
    const user = userEvent.setup();
    renderAnchored();
    await user.click(screen.getByTestId('anchor'));
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX + 1);
    expect((getPopper() as HTMLElement).style.zIndex).toBe(String(OVERLAY_BASE_Z_INDEX + 1));
  });

  test('stacks above a modal that raised the floor', async () => {
    const modalZ = OverlayStackingService.register('host-modal', 'modal', 3000);
    const user = userEvent.setup();
    renderAnchored();
    await user.click(screen.getByTestId('anchor'));
    expect(Number((getPopper() as HTMLElement).style.zIndex)).toBeGreaterThan(modalZ);
  });

  test('click away closes the popper, releases the slot, refocuses the anchor and reports onOpenChange(false)', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderAnchored({ onOpenChange });
    await user.click(screen.getByTestId('anchor'));
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus());
    onOpenChange.mockClear();

    await user.click(screen.getByTestId('outside'));

    await waitFor(() => expect(getPopper()).toBeNull());
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // handleClose() focuses the anchor wrapper div; the click then moves focus to the outside button
    expect(screen.getByTestId('outside')).toHaveFocus();
  });

  test('handleClose focuses the anchor element (the wrapper div around children)', async () => {
    const user = userEvent.setup();
    renderAnchored();
    const wrapper = getAnchorWrapper();
    const focusSpy = vi.spyOn(wrapper, 'focus');
    await user.click(screen.getByTestId('anchor'));
    await user.click(document.body);
    await waitFor(() => expect(getPopper()).toBeNull());
    expect(focusSpy).toHaveBeenCalled();
  });

  test('clicks inside the popper (input, options) do not count as click-away', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderAnchored({ autocompleteProps: { options: OPTIONS, testId: 'anchored-ac', onChange } });
    await user.click(screen.getByTestId('anchor'));
    const input = screen.getByRole('combobox');
    await user.click(input);
    // the Autocomplete listbox is a nested Popper portal (outside the anchor popper DOM). MUI's
    // ClickAwayListener uses React-tree based detection, so this still counts as "inside".
    await user.click(await screen.findByRole('option', { name: 'Option 2' }));

    expect(onChange).toHaveBeenCalledWith(expect.anything(), 'Option 2', 'selectOption', { option: 'Option 2' });
    expect(getPopper()).not.toBeNull();
  });

  test('controlled open=true (stories usage) shows the listbox as soon as the popper opens', async () => {
    const user = userEvent.setup();
    renderAnchored({ autocompleteProps: { options: OPTIONS, testId: 'anchored-ac', open: true } });
    // the listbox portals even before the anchor popper opens (open is forced on the Autocomplete) -> it only
    // mounts once the PopoverPopper renders its children
    expect(screen.queryByRole('listbox')).toBeNull();
    await user.click(screen.getByTestId('anchor'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(OPTIONS);
    // anchor popper slot + forced-open listbox slot
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX + 2);
  });

  test('unmounting while open releases the slot', async () => {
    const user = userEvent.setup();
    const { unmount } = renderAnchored();
    await user.click(screen.getByTestId('anchor'));
    unmount();
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);
    expect(getPopper()).toBeNull();
  });

  test('works without onOpenChange', async () => {
    const user = userEvent.setup();
    renderAnchored({ onOpenChange: undefined });
    await user.click(screen.getByTestId('anchor'));
    expect(getPopper()).not.toBeNull();
  });
});
