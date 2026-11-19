import { Modal as MuiModal } from '@mui/material';
import { act, render } from '@testing-library/react';
import React from 'react';
import { createPortal } from 'react-dom';
import { describe, expect, it } from 'vitest';
import { ModalHost } from './ModalHost';

/**
 * MUI 9.5 FocusTrap differential (Codex review, handoff 11): enforcement turns on once focus enters a modal opened
 * with disableAutoFocus, and an element focused through the React tree (a portaled descendant) is not pulled back.
 */
type Host = 'mui' | 'own';

const Shell = ({
  host,
  disableAutoFocus,
  children,
}: {
  host: Host;
  disableAutoFocus?: boolean;
  children: React.ReactNode;
}) =>
  host === 'mui' ? (
    <MuiModal open disableAutoFocus={disableAutoFocus}>
      <div tabIndex={-1}>{children}</div>
    </MuiModal>
  ) : (
    <ModalHost open disableAutoFocus={disableAutoFocus}>
      <div tabIndex={-1}>{children}</div>
    </ModalHost>
  );

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

const scenario = async (
  host: Host,
  build: (outside: HTMLElement) => React.ReactNode,
  steps: (outside: HTMLElement) => void,
) => {
  const outside = document.createElement('button');
  outside.textContent = 'outside';
  document.body.appendChild(outside);
  const view = render(build(outside) as React.ReactElement);
  await flush();
  await act(async () => {
    steps(outside);
  });
  await flush();
  const active = document.activeElement as HTMLElement;
  const out =
    active === document.body ? 'body' : (active.getAttribute('data-name') ?? active.textContent ?? active.tagName);
  view.unmount();
  outside.remove();
  return out;
};

describe('ModalHost focus enforcement equals MUI FocusTrap', () => {
  it('disableAutoFocus: once focus enters, focus leaving is pulled back', async () => {
    const run = (host: Host) =>
      scenario(
        host,
        () => (
          <Shell host={host} disableAutoFocus>
            <button type="button" data-name="inside">
              {'inside'}
            </button>
          </Shell>
        ),
        (outside) => {
          (document.querySelector('[data-name="inside"]') as HTMLElement).focus();
          outside.focus();
        },
      );
    const mui = await run('mui');
    expect(mui).not.toBe('outside');
    expect(await run('own')).toBe(mui);
  });

  it('an element portaled from the modal subtree keeps focus', async () => {
    const run = (host: Host) =>
      scenario(
        host,
        () => (
          <Shell host={host}>
            <span>{'content'}</span>
            {createPortal(
              <button type="button" data-name="portaled">
                {'portaled'}
              </button>,
              document.body,
            )}
          </Shell>
        ),
        () => {
          (document.querySelector('[data-name="portaled"]') as HTMLElement).focus();
        },
      );
    const mui = await run('mui');
    expect(mui).toBe('portaled');
    expect(await run('own')).toBe(mui);
  });

  // SearchableSelect differential (queue 2.5): root and backdrop DOM as MUI 9.5 Modal renders them.
  it('root and backdrop DOM: class order, attribute order, no aria-hidden on the backdrop', async () => {
    const norm = (html: string) =>
      html
        .replace(/ ?\bcss-[a-z0-9]+(-[A-Za-z0-9]+)*/g, '')
        .replace(/ class=""/g, '')
        .replace(/ data-vg-core=""/g, '')
        .replace(/ data-slot="[^"]*"/g, '')
        .replace(/ data-open=""/g, '')
        .replace(/ (id|aria-labelledby)="[^"]*"/g, ' $1="ID"')
        .replace(
          /<div tabindex="0" data-testid="sentinelStart"><\/div>.*<div tabindex="0" data-testid="sentinelEnd"><\/div>/s,
          'BODY',
        );
    const go = async (host: Host) => {
      const view = render(
        host === 'mui' ? (
          <MuiModal open className="custom" style={{ zIndex: 1101 }} slotProps={{ backdrop: { invisible: true } }}>
            <div tabIndex={-1}>{'content'}</div>
          </MuiModal>
        ) : (
          // MenuPopup passes MUI Modal's backdrop Fade style (opacity 1, 225 ms) as backdropStyle.
          <ModalHost
            open
            className="custom"
            style={{ zIndex: 1101 }}
            backdropStyle={{ opacity: 1, transition: 'opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms' }}
          >
            <div tabIndex={-1}>{'content'}</div>
          </ModalHost>
        ),
      );
      await flush();
      const root = document.body.querySelector('.MuiModal-root') as HTMLElement;
      const out = norm(root.outerHTML);
      view.unmount();
      return out;
    };
    expect(await go('own')).toBe(await go('mui'));
  });
});
