import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { VanguardThemeProvider } from '../VanguardThemeProvider/VanguardThemeProvider';
import { ChipMui } from './_ChipMui.reference';
import { Chip, ChipProps } from './Chip';

/**
 * Differential parity (track g): the former MUI 9.5 Chip path (verbatim, _ChipMui.reference.tsx) vs the own Chip over
 * the whole prop matrix and the interactions. Whole subtree: tags, classes (emotion `css-*` and the own typography
 * marker dropped, set semantics: MUI's ButtonBase lists Mui-focusVisible twice), attributes (own-core markers
 * dropped), inline styles, text; plus the callbacks each interaction fires.
 */
type Impl = 'mui' | 'own';
const OWN_ONLY = new Set([
  'data-vg-core',
  'data-slot',
  'data-variant',
  'data-size',
  'data-disabled',
  'data-icon-color',
]);
const OWN_CLASSES = new Set(['vg-typography-vanguard']);

type Node = { tag: string; classes: string[]; attrs: string[]; style: string | null; text?: string; children: Node[] };
const describeTree = (el: Element): Node => ({
  tag: el.tagName,
  classes: [
    ...new Set(
      (el.getAttribute('class') ?? '').split(/\s+/).filter((c) => c && !/^css-/.test(c) && !OWN_CLASSES.has(c)),
    ),
  ],
  attrs: el
    .getAttributeNames()
    .filter((n) => n !== 'class' && n !== 'style' && !OWN_ONLY.has(n))
    .sort()
    .map((n) => `${n}=${el.getAttribute(n)}`),
  style: el.getAttribute('style'),
  ...(el.children.length === 0 && el.textContent ? { text: el.textContent } : {}),
  children: [...el.children].map(describeTree),
});

const sizes = [undefined, 'small', 'medium'] as const;
const variants = [undefined, 'outlined', 'filled'] as const;
const kinds = ['none', 'click', 'delete', 'clickDelete'] as const;
const matrix: { name: string; props: Partial<ChipProps> }[] = [];
for (const size of sizes)
  for (const variant of variants)
    for (const kind of kinds)
      for (const disabled of [undefined, true])
        for (const icon of [
          undefined,
          <svg key="i" data-x="icon" />,
          <svg key="c" data-x="icon" color="primary" className="mine" />,
        ])
          matrix.push({
            name: `${size}/${variant}/${kind}/${disabled ? 'disabled' : ''}/${icon ? (icon.props.color ?? 'icon') : ''}`,
            props: {
              size,
              variant,
              disabled,
              icon,
              ...(kind.includes('lick') ? { onClick: () => {} } : {}),
              ...(kind.includes('elete') ? { onDelete: () => {} } : {}),
            },
          });
matrix.push(
  // Autocomplete getItemProps spread (A's Autocomplete renderValue).
  {
    name: 'autocomplete',
    props: {
      onDelete: () => {},
      className: 'MuiAutocomplete-tag',
      tabIndex: -1,
      'data-item-index': 0,
      'data-tag-index': 0,
      testId: 'ac-chip-0',
    } as Partial<ChipProps>,
  },
  {
    name: 'html attrs',
    props: { id: 'x', title: 't', style: { margin: 3 }, 'aria-label': 'lbl' } as Partial<ChipProps>,
  },
  { name: 'node label', props: { label: <b>bold</b> } },
);

const element = (impl: Impl, p: Partial<ChipProps>) =>
  impl === 'mui' ? <ChipMui label="Label" {...p} /> : <Chip label="Label" {...p} />;

describe('Chip parity: MUI 9.5 path vs own', () => {
  for (const theme of ['default', 'vanguard'] as const)
    it(`DOM over ${matrix.length} prop combinations (${theme} theme)`, () => {
      const wrap = (n: React.ReactElement) =>
        theme === 'vanguard' ? <VanguardThemeProvider>{n}</VanguardThemeProvider> : n;
      const diffs: string[] = [];
      for (const { name, props } of matrix) {
        const a = render(wrap(<div data-host="">{element('own', props)}</div>));
        const b = render(wrap(<div data-host="">{element('mui', props)}</div>));
        const own = describeTree(a.container.querySelector('[data-host]') as Element);
        const mui = describeTree(b.container.querySelector('[data-host]') as Element);
        if (JSON.stringify(own) !== JSON.stringify(mui))
          diffs.push(`${name}\n own=${JSON.stringify(own)}\n mui=${JSON.stringify(mui)}`);
        a.unmount();
        b.unmount();
      }
      expect(diffs).toEqual([]);
    });

  type Step = 'click' | 'clickDelete' | 'keyBackspace' | 'keyDelete' | 'keyEnter' | 'keyOnLabel' | 'focus' | 'blur';
  const run = (impl: Impl, props: Partial<ChipProps>, steps: Step[]) => {
    const calls: string[] = [];
    const p = {
      ...props,
      ...(props.onClick ? { onClick: (e: React.MouseEvent) => calls.push(`click:${e.type}`) } : {}),
      ...(props.onDelete
        ? {
            onDelete: (e: React.SyntheticEvent) =>
              calls.push(`delete:${e.type}:${(e as React.KeyboardEvent).key ?? ''}`),
          }
        : {}),
      onKeyDown: (e: React.KeyboardEvent) => calls.push(`keydown:${e.key}:${e.defaultPrevented}`),
      onKeyUp: (e: React.KeyboardEvent) => calls.push(`keyup:${e.key}`),
    };
    const view = render(<div data-host="">{element(impl, p)}</div>);
    const root = view.container.querySelector('.MuiChip-root') as HTMLElement;
    const trace: unknown[] = [];
    for (const step of steps) {
      if (step === 'click') fireEvent.click(root);
      else if (step === 'clickDelete') fireEvent.click(root.querySelector('.MuiChip-deleteIcon') as Element);
      else if (step === 'keyOnLabel') {
        fireEvent.keyDown(root.querySelector('.MuiChip-label') as Element, { key: 'Backspace' });
        fireEvent.keyUp(root.querySelector('.MuiChip-label') as Element, { key: 'Backspace' });
      } else if (step === 'focus') act(() => root.focus());
      else if (step === 'blur') act(() => root.blur());
      else {
        const key = step.slice(3);
        fireEvent.keyDown(root, { key });
        fireEvent.keyUp(root, { key });
      }
      trace.push({
        step,
        calls: [...calls],
        dom: describeTree(view.container.querySelector('[data-host]') as Element),
        active: document.activeElement === root,
      });
    }
    view.unmount();
    return trace;
  };
  const steps: Step[] = ['focus', 'click', 'keyEnter', 'keyBackspace', 'keyDelete', 'keyOnLabel', 'blur'];
  const interactive: Record<string, Partial<ChipProps>> = {
    clickable: { onClick: () => {} },
    deletable: { onDelete: () => {} },
    both: { onClick: () => {}, onDelete: () => {} },
    plain: {},
    'deletable disabled': { onDelete: () => {}, disabled: true },
    'clickable disabled': { onClick: () => {}, disabled: true },
  };
  for (const [name, props] of Object.entries(interactive))
    it(`interactions: ${name}`, () => {
      const s: Step[] = props.onDelete ? [...steps, 'clickDelete'] : steps;
      expect(run('own', props, s)).toEqual(run('mui', props, s));
    });

  it('delete icon click does not reach onClick (stopPropagation), like MUI', () => {
    const onClick = vi.fn();
    const onDelete = vi.fn();
    const view = render(<Chip label="x" onClick={onClick} onDelete={onDelete} />);
    fireEvent.click(view.getByTestId('CancelIcon'));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});
