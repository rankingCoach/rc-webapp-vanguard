import { MenuItem as MuiMenuItem, Modal as MuiModal, TextField } from '@mui/material';
import { act, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MenuOption } from '../Menu/MenuOption';
import { SelectTextField } from './SelectTextField';

/**
 * Codex review of SearchableSelect (handoff 14): select/menu behaviours, MUI 9.5 TextField select vs the own
 * SelectTextField (and the own ModalHost / MenuList under it).
 */
type Impl = 'mui' | 'own';
const Field = (impl: Impl) => (impl === 'mui' ? TextField : SelectTextField) as React.ElementType;
const Item = (impl: Impl) => (impl === 'mui' ? MuiMenuItem : MenuOption) as React.ElementType;

const tick = (ms = 20) =>
  act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
const focusedText = () => (document.activeElement as HTMLElement | null)?.textContent ?? null;

type HarnessProps = { F: React.ElementType; I: React.ElementType };

const ValueHost = ({ F, I, onSet }: HarnessProps & { onSet: (set: (v: string) => void) => void }) => {
  const [value, setValue] = useState('a');
  onSet(setValue);
  return (
    <F select id="f" value={value} slotProps={{ select: { MenuProps: { autoFocus: false } } }}>
      <I value="a">{'A'}</I>
      <I value="b">{'B'}</I>
    </F>
  );
};

const ModalHostHarness = ({ F, I, onOpener }: HarnessProps & { onOpener: (open: () => void) => void }) => {
  const [modal, setModal] = useState(false);
  onOpener(() => setModal(true));
  return (
    <>
      <F select id="f" value="a">
        <I value="a">{'A'}</I>
      </F>
      <MuiModal open={modal}>
        <div>
          <button type="button">{'in modal'}</button>
        </div>
      </MuiModal>
    </>
  );
};

afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
});

describe('select/menu behaviour equals MUI', () => {
  it('uncontrolled without value: the first click on an empty-value option reports the change', async () => {
    const go = async (impl: Impl) => {
      const F = Field(impl);
      const I = Item(impl);
      const onChange = vi.fn();
      const user = userEvent.setup();
      const v = render(
        <F select id="f" onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}>
          <I value="">{'All'}</I>
          <I value="x">{'X'}</I>
        </F>,
      );
      await user.click(v.container.querySelector('[role="combobox"]') as HTMLElement);
      await user.click(document.querySelector('[role="option"]') as HTMLElement);
      v.unmount();
      return onChange.mock.calls;
    };
    expect(await go('own')).toEqual(await go('mui'));
  });

  it('Shift+Tab from the initially focused paper reaches the last tabbable element, not the paper', async () => {
    const go = async (impl: Impl) => {
      const F = Field(impl);
      const I = Item(impl);
      const user = userEvent.setup();
      const v = render(
        <F select id="f" value="a" slotProps={{ select: { MenuProps: { autoFocus: false } } }}>
          <I value="a">{'A'}</I>
          <I value="b">{'B'}</I>
        </F>,
      );
      await user.click(v.container.querySelector('[role="combobox"]') as HTMLElement);
      await tick();
      await user.tab({ shift: true });
      await tick();
      const out = focusedText();
      v.unmount();
      return out;
    };
    expect(await go('own')).toBe(await go('mui'));
  });

  it('a controlled value change while open moves the tab stop to the newly selected option', async () => {
    const go = async (impl: Impl) => {
      const F = Field(impl);
      const I = Item(impl);
      let set: (v: string) => void = () => undefined;
      const user = userEvent.setup();
      const v = render(
        <ValueHost
          F={F}
          I={I}
          onSet={(fn) => {
            set = fn;
          }}
        />,
      );
      await user.click(v.container.querySelector('[role="combobox"]') as HTMLElement);
      await tick();
      act(() => set('b'));
      await tick();
      const out = Array.from(document.querySelectorAll('[role="option"]')).map(
        (el) => `${el.textContent}:${el.getAttribute('tabindex')}`,
      );
      v.unmount();
      return out;
    };
    expect(await go('own')).toEqual(await go('mui'));
  });

  it('closed typeahead resets when the selected option disappears', async () => {
    const go = async (impl: Impl) => {
      const F = Field(impl);
      const I = Item(impl);
      const onChange = vi.fn();
      const tree = (opts: string[]) => (
        <F select id="f" value="Alpha" onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}>
          {opts.map((o) => (
            <I key={o} value={o}>
              {o}
            </I>
          ))}
        </F>
      );
      const v = render(tree(['Alpha', 'Beta']));
      const display = v.container.querySelector('[role="combobox"]') as HTMLElement;
      fireEvent.keyDown(display, { key: 'a' });
      v.rerender(tree(['Beta']));
      fireEvent.keyDown(display, { key: 'b' });
      v.unmount();
      return onChange.mock.calls;
    };
    expect(await go('own')).toEqual(await go('mui'));
  });

  it('a closing menu is aria-hidden during its exit transition', async () => {
    const go = async (impl: Impl) => {
      const F = Field(impl);
      const I = Item(impl);
      const user = userEvent.setup();
      const v = render(
        <F select id="f" value="a">
          <I value="a">{'A'}</I>
          <I value="b">{'B'}</I>
        </F>,
      );
      await user.click(v.container.querySelector('[role="combobox"]') as HTMLElement);
      await tick();
      fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Escape' });
      const root = document.querySelector('.MuiMenu-root') as HTMLElement | null;
      const out = root?.getAttribute('aria-hidden') ?? null;
      await tick(400);
      v.unmount();
      return out;
    };
    expect(await go('own')).toBe(await go('mui'));
  });

  it('a newer MUI Modal keeps focus while the own select menu is open below it', async () => {
    const go = async (impl: Impl) => {
      const F = Field(impl);
      const I = Item(impl);
      let openModal: () => void = () => undefined;
      const user = userEvent.setup();
      const v = render(
        <ModalHostHarness
          F={F}
          I={I}
          onOpener={(fn) => {
            openModal = fn;
          }}
        />,
      );
      await user.click(v.container.querySelector('[role="combobox"]') as HTMLElement);
      await tick();
      act(() => openModal());
      await tick(100);
      (document.querySelector('.MuiModal-root:last-of-type button') as HTMLElement | null)?.focus();
      await tick(100);
      const out = focusedText();
      v.unmount();
      return out;
    };
    expect(await go('own')).toBe(await go('mui'));
  });
});
