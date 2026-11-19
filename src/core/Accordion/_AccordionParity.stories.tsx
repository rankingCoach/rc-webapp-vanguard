import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { VanguardThemeProvider } from '../VanguardThemeProvider/VanguardThemeProvider';
import { AccordionMui } from './_AccordionMui.reference';
import { Accordion, AccordionProps } from './Accordion';

/**
 * Track g differential in Chromium: the own Accordion vs the former MUI path (_AccordionMui.reference.tsx), side by
 * side, with and without VanguardThemeProvider. Each case is a GROUP of sibling accordions (MUI's :first-of-type,
 * :last-of-type and `.Mui-expanded + .Mui-expanded` rules only apply between siblings). Compared: computed styles of
 * every part incl. the root's ::before divider, the boxes, after a click toggle, and the focus-visible summary.
 */
const GROUPS: Record<string, Partial<AccordionProps>[]> = {
  elevation: [{}, { expanded: true }, { expanded: true }, {}],
  outlined: [{ variant: 'outlined' }, { variant: 'outlined', expanded: true }, { variant: 'outlined' }],
  noGutters: [{ disableGutters: true }, { disableGutters: true, expanded: true }],
  styled: [
    {
      summaryCustomStyle: { padding: '10px' },
      baseCustomStyle: { border: '2px solid red' },
      detailsCustomStyle: { padding: '15px' },
    },
    { summaryChildren: undefined, reverse: true, expanded: true },
  ],
};
const PARTS: Record<string, string> = {
  root: '.MuiAccordion-root',
  heading: '.MuiAccordion-heading',
  summary: '.MuiAccordionSummary-root',
  content: '.MuiAccordionSummary-content',
  icon: '.MuiAccordionSummary-expandIconWrapper',
  collapse: '.MuiCollapse-root',
  region: '.MuiAccordion-region',
  details: '.MuiAccordionDetails-root',
};
const PROPS = [
  'display',
  'position',
  'box-sizing',
  'width',
  'min-height',
  'height',
  'margin',
  'padding',
  'border',
  'border-radius',
  'background-color',
  'background-image',
  'box-shadow',
  'color',
  'opacity',
  'transform',
  'transition',
  'overflow',
  'visibility',
  'flex-direction',
  'flex-grow',
  'align-items',
  'justify-content',
  'text-align',
  'cursor',
  'outline',
  'user-select',
  'vertical-align',
  'z-index',
  'overflow-anchor',
  'content',
  'top',
  'left',
  'right',
];

const pick = (el: Element | null, pseudo?: string) => {
  if (!el) return null;
  const cs = getComputedStyle(el, pseudo);
  return Object.fromEntries(PROPS.map((p) => [p, cs.getPropertyValue(p)]));
};
const box = (el: Element | null) =>
  el ? (({ width, height }) => ({ width, height }))(el.getBoundingClientRect()) : null;

const measure = (group: Element) =>
  [...group.querySelectorAll(':scope > .MuiAccordion-root')].map((acc) => ({
    before: pick(acc, '::before'),
    ...Object.fromEntries(
      Object.entries(PARTS).map(([name, sel]) => {
        const el = name === 'root' ? acc : acc.querySelector(sel);
        return [name, { style: pick(el), box: box(el) }];
      }),
    ),
  }));

const Grid = () => (
  <div style={{ width: 420 }}>
    {Object.entries(GROUPS).map(([name, items]) =>
      (['mui', 'own'] as const).map((impl) => (
        <React.Fragment key={`${name}-${impl}`}>
          <button type="button" data-anchor={`${name}-${impl}`}>
            anchor
          </button>
          <div data-group={name} data-impl={impl} style={{ marginBottom: 24 }}>
            {items.map((p, i) => {
              const props: AccordionProps = {
                accordionId: `${impl}-${name}-${i}`,
                summaryChildren: <span>Summary {i}</span>,
                detailsChildren: (
                  <p>Details {i}: some text that wraps over a couple of lines inside the accordion body.</p>
                ),
                ...p,
              };
              return impl === 'mui' ? <AccordionMui key={i} {...props} /> : <Accordion key={i} {...props} />;
            })}
          </div>
        </React.Fragment>
      )),
    )}
  </div>
);

const flat = (v: unknown, path = '', out: Record<string, unknown> = {}) => {
  if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) flat(x, path ? `${path}.${k}` : k, out);
  else out[path] = v;
  return out;
};
const diff = (own: unknown, mui: unknown) => {
  const a = flat(own);
  const b = flat(mui);
  return [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .filter((k) => a[k] !== b[k])
    .map((k) => `${k}: own=${a[k]} mui=${b[k]}`);
};

const settle = () => new Promise((r) => setTimeout(r, 700));

const play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const get = (name: string, impl: string) =>
    canvasElement.querySelector(`[data-group="${name}"][data-impl="${impl}"]`) as Element;
  const compare = async (label: string) => {
    for (const name of Object.keys(GROUPS)) {
      // Differences as readable paths (`own` vs `mui`), so a failure names the part and property.
      await waitFor(() =>
        expect({ label, name, diffs: diff(measure(get(name, 'own')), measure(get(name, 'mui'))) }).toEqual({
          label,
          name,
          diffs: [],
        }),
      );
    }
  };
  await settle();
  await compare('initial');

  // Toggle the first accordion of every group on both sides, settle, compare; then toggle back.
  for (const round of ['toggled', 'toggled back']) {
    for (const name of Object.keys(GROUPS))
      for (const impl of ['mui', 'own']) {
        const summary = get(name, impl).querySelector('.MuiAccordionSummary-root') as HTMLElement;
        if (getComputedStyle(summary).display !== 'none') {
          await userEvent.click(summary);
          // Synthetic clicks focus programmatically; Chromium then lets :focus-visible follow the previously focused
          // element, so the second side clicked would differ by order alone. Real mouse clicks never match it.
          summary.blur();
        }
      }
    await settle();
    await compare(round);
  }

  // Keyboard focus (Tab from the anchor button) → focus-visible summary: MUI's Mui-focusVisible background.
  const focused: Record<string, unknown> = {};
  for (const impl of ['mui', 'own']) {
    const summary = get('elevation', impl).querySelector('.MuiAccordionSummary-root') as HTMLElement;
    (canvasElement.querySelector(`[data-anchor="elevation-${impl}"]`) as HTMLElement).focus();
    await userEvent.tab();
    focused[impl] = await waitFor(() => {
      expect(document.activeElement).toBe(summary);
      expect(summary.classList.contains('Mui-focusVisible')).toBe(true);
      return { classes: [...new Set(summary.classList)].filter((c) => !c.startsWith('css-')), style: pick(summary) };
    });
    summary.blur();
  }
  await expect(focused.own).toEqual(focused.mui);
};

export const DefaultTheme: StoryObj = { render: () => <Grid />, play };
export const VanguardTheme: StoryObj = {
  render: () => (
    <VanguardThemeProvider>
      <Grid />
    </VanguardThemeProvider>
  ),
  play,
};

export default { ...SbDecorator({ title: 'Vanguard/Accordion/ParityDifferential', component: Accordion }) };
