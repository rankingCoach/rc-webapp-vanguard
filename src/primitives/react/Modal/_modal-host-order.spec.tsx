import { act, render } from '@test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import { DrawerMuiReference } from '@vanguard/Drawer/_Drawer.mui-reference';
import { Drawer } from '@vanguard/Drawer/Drawer';
import { SearchableSelectMuiReference } from '@vanguard/SearchableSelect/_SearchableSelect.mui-reference';
import { SearchableSelect } from '@vanguard/SearchableSelect/SearchableSelect';
import React, { Profiler, StrictMode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * ModalHost two-phase mount (H16 fix) vs MUI's Portal timing. For the own Drawer and SearchableSelect (MenuPopup) vs
 * their frozen MUI implementations, one open/close timeline records, in order, the body mutations and focus moves
 * (scroll lock, sibling aria-hidden, modal root attached, focus entering the content) and the number of React
 * commits; both must equal MUI's, with and without StrictMode.
 */
type Impl = 'mui' | 'own';

const record = () => {
  const log: string[] = [];
  const push = (t: string) => {
    if (log[log.length - 1] !== t) log.push(t);
  };
  const flush = (records: MutationRecord[]) => {
    for (const r of records) {
      if (r.type === 'attributes' && r.target === document.body && r.attributeName === 'style')
        push(`body:${document.body.style.overflow === 'hidden' ? 'locked' : 'unlocked'}`);
      if (
        r.type === 'attributes' &&
        r.attributeName === 'aria-hidden' &&
        (r.target as Element).parentElement === document.body
      )
        push(`aria-hidden:${(r.target as Element).getAttribute('aria-hidden') ?? 'removed'}`);
      if (r.type === 'childList')
        for (const n of Array.from(r.addedNodes))
          if ((n as Element).classList?.contains('MuiModal-root')) push('modal-root:attached');
    }
  };
  const observer = new MutationObserver(flush);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['style', 'aria-hidden'],
    childList: true,
    subtree: true,
  });
  const onFocus = (e: FocusEvent) => {
    flush(observer.takeRecords());
    const inModal = Boolean((e.target as Element).closest?.('.MuiModal-root'));
    push(`focus:${inModal ? 'modal' : 'page'}`);
  };
  document.addEventListener('focusin', onFocus);
  return {
    log,
    stop: () => {
      flush(observer.takeRecords());
      observer.disconnect();
      document.removeEventListener('focusin', onFocus);
    },
  };
};

afterEach(() => {
  document.body.innerHTML = '';
  document.body.removeAttribute('style');
});

const settle = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 700));
  });

const drawer = async (impl: Impl, strict: boolean, closeBeforeReady: boolean) => {
  const D = (impl === 'mui' ? DrawerMuiReference : Drawer) as React.ElementType;
  let commits = 0;
  const tree = (open: boolean) => {
    const el = (
      <Profiler id="d" onRender={() => commits++}>
        <button type="button">{'page'}</button>
        <D open={open} variant="temporary" title="T">
          <button type="button">{'inside'}</button>
        </D>
      </Profiler>
    );
    return strict ? <StrictMode>{el}</StrictMode> : el;
  };
  const view = render(tree(false));
  const rec = record();
  commits = 0;
  if (closeBeforeReady) {
    // open → close in one batch: nothing may stay locked or steal focus
    await act(async () => {
      view.rerender(tree(true));
      view.rerender(tree(false));
    });
  } else {
    await act(async () => {
      view.rerender(tree(true));
    });
  }
  const openCommits = commits;
  await settle();
  view.rerender(tree(false));
  await settle();
  rec.stop();
  const body = document.body.getAttribute('style') ?? '';
  view.unmount();
  return { order: rec.log, openCommits, body };
};

const select = async (impl: Impl, strict: boolean) => {
  const S = (impl === 'mui' ? SearchableSelectMuiReference : SearchableSelect) as React.ElementType;
  const user = userEvent.setup();
  let commits = 0;
  const options = Array.from({ length: 3 }, (_, i) => ({ key: i, value: `v${i}`, title: `Title ${i}` }));
  const el = (
    <Profiler id="s" onRender={() => commits++}>
      <S options={options} value="v1" />
    </Profiler>
  );
  const view = render(strict ? <StrictMode>{el}</StrictMode> : el);
  await settle();
  const rec = record();
  commits = 0;
  await user.click(view.getByRole('combobox'));
  const openCommits = commits;
  await settle();
  await user.keyboard('{Escape}');
  await settle();
  rec.stop();
  view.unmount();
  return { order: rec.log, openCommits };
};

for (const strict of [false, true]) {
  describe(`ModalHost order and commits equal MUI${strict ? ' (StrictMode)' : ''}`, () => {
    it('temporary Drawer: open, close', async () => {
      expect(await drawer('own', strict, false)).toEqual(await drawer('mui', strict, false));
    });
    it('temporary Drawer: open → close before the portal is ready', async () => {
      expect(await drawer('own', strict, true)).toEqual(await drawer('mui', strict, true));
    });
    it('SearchableSelect menu: open, Escape', async () => {
      // MUI's Select bounces focus modal → page → modal while opening (Menu autoFocus, then the trap pulls it back),
      // all inside the opening task, so no frame shows it; the own core focuses the list once. Collapsed here.
      const collapse = (order: string[]) =>
        order
          .filter((t, i) => !(t === 'focus:page' && order[i - 1] === 'focus:modal' && order[i + 1] === 'focus:modal'))
          .filter((t, i, arr) => arr[i - 1] !== t);
      const own = await select('own', strict);
      const mui = await select('mui', strict);
      expect(collapse(own.order)).toEqual(collapse(mui.order));
      // Two-phase mount: at most one commit more than MUI per open (Tier P rule: +2 or 1.5x fails).
      expect(own.openCommits).toBeLessThanOrEqual(mui.openCommits + 1);
    });
  });
}
