import { StoryObj } from '@storybook/react';
import { EntryCss, RouteCss } from '@test-utils/consumer-css';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { Input } from '@vanguard/Input/Input';
import React from 'react';
import { expect, within } from 'storybook/test';
import { Textarea } from './Textarea';

/**
 * Production-order fixtures (D15) for every rc-webapp rule in the built CSS that targets the InputBase/OutlinedInput
 * of Vanguard's Input/Textarea (inventory `consumer-mui-inventory.json`, plan §21). Each pair renders the same
 * Vanguard component twice: "legacy" forced onto MUI's TextField (`textFieldProps.classes` keeps MuiTextField on MUI)
 * and "own" on the own-core text field. Consumer CSS sits where the built app loads it (RouteCss: route chunk after
 * vanguard.css and emotion; EntryCss: entry chunk before both), so the legacy column is the production reference.
 * The play functions compare the painted properties of each rule; agentic-plans/uisdk-tools/pixel-diff.mjs compares
 * the pairs pixel by pixel (labels `legacy-*` / `own-*`).
 *
 * Not fixtured: ArrayMapViewer's `.textarea-json .MuiInputBase-root/-input { height }` (2 rules) target
 * react-json-editor's editor, not a Vanguard element.
 */
export default {
  ...SbDecorator({ title: 'Vanguard/Textarea/Consumer Override Parity', component: Textarea }),
};

type Story = StoryObj<typeof Textarea>;

const LEGACY = { classes: {} };

// AiVisibilityCustomQueryDraftRow.module.scss (route chunk ai-visibility): 17 rules, colours as literals.
const aivCss = `
.aiv-input { flex: 1; min-width: 0; }
.aiv-input .MuiInputBase-root.MuiOutlinedInput-root { background: rgb(240, 241, 245); border-radius: 12px; }
.aiv-input .MuiInputBase-root .MuiOutlinedInput-notchedOutline,
.aiv-input .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline { border-color: transparent; }
.aiv-input .MuiInputBase-root.MuiOutlinedInput-root.Mui-focused { background: rgb(255, 255, 255); }
.aiv-input .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline { border-width: 1px; border-color: rgb(200, 205, 215); }
.aiv-input .MuiInputBase-root.Mui-disabled { background: rgb(240, 241, 245); }
.aiv-input .MuiInputBase-root.Mui-disabled .MuiOutlinedInput-notchedOutline { border-color: transparent; background: transparent; }
.aiv-input .MuiInputBase-root.Mui-disabled:hover .MuiOutlinedInput-notchedOutline { border-color: transparent; }
.aiv-input .MuiInputBase-root.Mui-disabled textarea { -webkit-text-fill-color: rgb(20, 24, 40); color: rgb(20, 24, 40); }
.aiv-input .MuiInputBase-root textarea { overflow-wrap: anywhere; }
.aiv-valid .MuiInputBase-root { background: rgb(220, 245, 230); }
.aiv-valid .MuiInputBase-root .MuiOutlinedInput-input { color: rgb(10, 80, 40); -webkit-text-fill-color: rgb(10, 80, 40); }
.aiv-valid .MuiInputBase-root.MuiOutlinedInput-root.Mui-disabled { background: rgb(220, 245, 230); opacity: 1; }
.aiv-valid .MuiInputBase-root.Mui-disabled .MuiOutlinedInput-input { -webkit-text-fill-color: rgb(10, 80, 40); }
.aiv-flagged { flex: 0 0 auto; }
.aiv-flagged .MuiInputBase-root.MuiOutlinedInput-root { background: rgb(253, 228, 228); }
.aiv-flagged .MuiInputBase-root.MuiOutlinedInput-root.Mui-focused { background: rgb(253, 228, 228); }
.aiv-flagged .MuiInputBase-root .MuiOutlinedInput-input { color: rgb(150, 20, 20); -webkit-text-fill-color: rgb(150, 20, 20); }
`;

type Variant = { name: string; className: string; disabled?: boolean; focused?: boolean };
const aivVariants: Variant[] = [
  { name: 'rest', className: 'aiv-input' },
  { name: 'focused', className: 'aiv-input', focused: true },
  { name: 'auditing', className: 'aiv-input', disabled: true },
  { name: 'valid', className: 'aiv-input aiv-valid', disabled: true },
  { name: 'flagged', className: 'aiv-input aiv-flagged' },
  { name: 'flagged-focused', className: 'aiv-input aiv-flagged', focused: true },
];

const AivRow = ({ variant, legacy }: { variant: Variant; legacy: boolean }) => (
  <div aria-label={`${legacy ? 'legacy' : 'own'}-aiv-${variant.name}`} style={{ display: 'flex', width: 420 }}>
    <Textarea
      className={variant.className}
      value={'best plumber near me competitors!!!!!competitors!!!!!competitors'}
      minRows={1}
      maxRows={4}
      counter={false}
      disabled={variant.disabled}
      label={''}
      {...({
        textFieldProps: { ...(legacy ? LEGACY : {}), ...(variant.focused ? { focused: true } : {}) },
      } as object)}
    />
  </div>
);

const painted = (wrapper: HTMLElement) => {
  const root = wrapper.querySelector<HTMLElement>('.MuiInputBase-root') as HTMLElement;
  const outline = root.querySelector<HTMLElement>('.MuiOutlinedInput-notchedOutline') as HTMLElement;
  const field = root.querySelector<HTMLElement>('textarea:not([aria-hidden]), input') as HTMLElement;
  const r = getComputedStyle(root);
  const o = getComputedStyle(outline);
  const f = getComputedStyle(field);
  return {
    root: { bg: r.backgroundColor, radius: r.borderRadius, opacity: r.opacity, h: root.getBoundingClientRect().height },
    outline: { color: o.borderTopColor, width: o.borderTopWidth, bg: o.backgroundColor },
    field: {
      color: f.color,
      fill: f.getPropertyValue('-webkit-text-fill-color'),
      wrap: f.overflowWrap,
      padding: f.padding,
      font: `${f.fontSize}/${f.lineHeight}`,
      h: field.getBoundingClientRect().height,
    },
  };
};

export const AiVisibilityDraftRowRouteOrderMatchesLegacy: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <RouteCss css={aivCss} />
      {aivVariants.map((v) => (
        <React.Fragment key={v.name}>
          <AivRow variant={v} legacy />
          <AivRow variant={v} legacy={false} />
        </React.Fragment>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    for (const v of aivVariants) {
      const own = painted(c.getByLabelText(`own-aiv-${v.name}`));
      const legacy = painted(c.getByLabelText(`legacy-aiv-${v.name}`));
      await expect({ variant: v.name, ...own }).toEqual({ variant: v.name, ...legacy });
    }
    // Production values pinned (route CSS wins every tie with MUI's rules, as it did in the built app).
    const rest = painted(c.getByLabelText('own-aiv-rest'));
    await expect(rest.root.bg).toBe('rgb(240, 241, 245)');
    await expect(rest.outline.color).toBe('rgba(0, 0, 0, 0)');
    await expect(rest.field.wrap).toBe('anywhere');
    const focused = painted(c.getByLabelText('own-aiv-focused'));
    await expect(focused.outline).toMatchObject({ color: 'rgb(200, 205, 215)', width: '1px' });
    const valid = painted(c.getByLabelText('own-aiv-valid'));
    await expect(valid.root).toMatchObject({ bg: 'rgb(220, 245, 230)', opacity: '1' });
    await expect(valid.field.fill).toBe('rgb(10, 80, 40)');
  },
};

// SetupKeywordChipsEditor.module.scss (ENTRY chunk): `.addInput .vanguard-input .MuiOutlinedInput-root
// .MuiOutlinedInput-input` (0,4,0) + the backdrop. Loaded before vanguard.css in production.
const chipsCss = `
.addInput { flex: 1 1 auto; min-width: 0; max-width: 320px; }
.addInput .vanguard-input .MuiOutlinedInput-root .MuiOutlinedInput-input,
.addInput .vanguard-input .vanguard-input-backdrop { height: auto; padding: 8px 12px; font-size: 14px; line-height: 16px; }
`;

const ChipsInput = ({ legacy, disabled }: { legacy: boolean; disabled?: boolean }) => (
  <div aria-label={`${legacy ? 'legacy' : 'own'}-chips${disabled ? '-disabled' : ''}`} style={{ width: 360 }}>
    <Input
      value={'plumber berlin'}
      placeholder={'e.g. a service and your city'}
      size="small"
      className="addInput"
      disabled={disabled}
      textFieldProps={legacy ? LEGACY : undefined}
    />
  </div>
);

export const SetupKeywordChipsEditorEntryOrderMatchesLegacy: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <EntryCss css={chipsCss} />
      <ChipsInput legacy />
      <ChipsInput legacy={false} />
      <ChipsInput legacy disabled />
      <ChipsInput legacy={false} disabled />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    for (const suffix of ['', '-disabled']) {
      await expect(painted(c.getByLabelText(`own-chips${suffix}`))).toEqual(
        painted(c.getByLabelText(`legacy-chips${suffix}`)),
      );
    }
    // Entry CSS loses its vertical padding to the later small-size skin (vanguard.css comes after the entry chunk):
    // the legacy column shows the same, so this is the production value, not a regression.
    await expect(painted(c.getByLabelText('own-chips')).field).toMatchObject({
      padding: '0px 12px',
      font: '14px/16px',
    });
  },
};
