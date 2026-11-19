import { readFileSync } from 'node:fs';
import path from 'node:path';
import { act, render } from '@test-utils/test-utils';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocumentDisplayMuiReference } from './DocumentDisplay/_DocumentDisplay.mui-reference';
import { DocumentDisplay } from './DocumentDisplay/DocumentDisplay';
import { DocumentUploadMuiReference } from './DocumentUpload/_DocumentUpload.mui-reference';
import { DocumentUpload } from './DocumentUpload/DocumentUpload';

/**
 * Differential parity, jsdom: DocumentDisplay / DocumentUpload on B's OwnCollapse vs the frozen MUI implementations.
 * DocumentDisplay: the name rows collapse in/out as documentName / fileName change (inline size and transition writes
 * at each step). DocumentUpload: the closed edit group on mount. Own-core markers normalised.
 */
type Impl = 'mui' | 'own';

const normalize = (html: string) =>
  html
    .replace(/ ?\bcss-[a-z0-9]+(-[A-Za-z0-9]+)*/g, '')
    .replace(/ class=""/g, '')
    .replace(/ data-vg-core=""/g, '')
    .replace(/ data-slot="[^"]*"/g, '')
    .replace(/ data-orientation="(vertical|horizontal)"/g, '')
    .replace(/ data-(open|disabled|selected|focus-visible|highlighted|checked|pressed|focused|filled)=""/g, '')
    .replace(/ (id|for|aria-labelledby|aria-controls|aria-describedby)="[^"]*"/g, ' $1="ID"');

const canonical = (html: string) => {
  const host = document.createElement('div');
  host.innerHTML = html;
  for (const el of Array.from(host.querySelectorAll('*'))) {
    const attrs = Array.from(el.attributes).map((a) => [a.name, a.value] as const);
    for (const [name] of attrs) el.removeAttribute(name);
    for (const [name, value] of attrs.sort(([x], [y]) => x.localeCompare(y))) {
      let v = value;
      if (name === 'class') v = value.split(/\s+/).filter(Boolean).sort().join(' ');
      if (name === 'style')
        v = value
          .split(';')
          .map((d) => d.trim())
          .filter(Boolean)
          .sort()
          .join('; ');
      el.setAttribute(name, v);
    }
  }
  return host.innerHTML;
};

const snapshot = () => canonical(normalize(document.body.innerHTML));

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

type DisplayProps = { documentName?: string; fileName?: string };
const display = (impl: Impl, steps: (DisplayProps | number)[]) => {
  vi.useFakeTimers();
  const D = (impl === 'mui' ? DocumentDisplayMuiReference : DocumentDisplay) as React.ElementType;
  let props: DisplayProps = {};
  const tree = () => <D fileSrc="data:application/pdf;base64,AA==" fileMimeType="application/pdf" {...props} />;
  const view = render(tree());
  const trace = [snapshot()];
  for (const step of steps) {
    if (typeof step === 'number')
      act(() => {
        vi.advanceTimersByTime(step);
      });
    else {
      props = step;
      view.rerender(tree());
    }
    trace.push(snapshot());
  }
  view.unmount();
  view.container.remove();
  return trace;
};

describe('Documents own core equals MUI', () => {
  it('DocumentDisplay: names collapse in and out', () => {
    const steps: (DisplayProps | number)[] = [
      { documentName: 'Contract', fileName: 'contract.pdf' },
      50,
      400,
      { fileName: 'contract.pdf' },
      50,
      400,
      {},
      400,
    ];
    expect(display('own', steps)).toEqual(display('mui', steps));
  });

  it('DocumentUpload: closed edit group on mount', () => {
    const go = (impl: Impl) => {
      const U = (impl === 'mui' ? DocumentUploadMuiReference : DocumentUpload) as React.ElementType;
      const view = render(<U onChange={() => undefined} />);
      const html = snapshot();
      view.unmount();
      view.container.remove();
      return html;
    };
    expect(go('own')).toEqual(go('mui'));
  });

  it('imports nothing from @mui', () => {
    for (const f of ['DocumentDisplay/DocumentDisplay.tsx', 'DocumentUpload/DocumentUpload.tsx'])
      expect(readFileSync(path.join(__dirname, f), 'utf8')).not.toMatch(/from '@mui\//);
  });
});
