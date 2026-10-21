import { IconNames } from '@vanguard/Icon/IconNames';
import React, { CSSProperties, ReactNode } from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';

import { Button, ButtonSizes, ButtonTextColors, ButtonTypes } from '../Button';
import { ButtonStory } from './_Button.default';

const ADO_BASE = 'rgb(0, 106, 133)'; // --ado-base (#006a85) in the default theme

// The theme values VAN-85 asks the webapp generator for. Scoped to a wrapper so the stories can show the
// transparent default button before the regenerated theme lands; the real values come from the theme.
const TRANSPARENT_DEFAULT_THEME = {
  '--button-default-background-color': 'transparent',
  '--button-default-hover-background-color': 'rgba(185, 197, 216, 0.12)',
} as CSSProperties;

const SURFACES = [
  { key: 'white', label: 'White surface (--fn-bg)', background: '#ffffff' },
  { key: 'grey', label: 'Grey surface (--fn-bg-var)', background: '#f6f9fc' },
  { key: 'blue', label: 'Tinted surface (--i100)', background: '#e5f1ff' },
];

const Row = ({ label, background, children }: { label: string; background: string; children: ReactNode }) => (
  <div
    style={{
      background,
      border: '1px solid #e3e8ef',
      borderRadius: '12px',
      padding: '16px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}
  >
    <span style={{ fontSize: '12px', fontWeight: 500, color: '#263349' }}>{label}</span>
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>{children}</div>
  </div>
);

const getLabel = (button: HTMLElement) => button.querySelector<HTMLElement>('[class*="button-text"]');
const getIconSvg = (button: HTMLElement) => button.querySelector<SVGElement>('svg');

const textColorDescription = `
The default button takes a \`textColor\` from a fixed set (\`ButtonTextColors\`). It colours the label and the icon,
at rest and on hover/focus (derived: 25% towards black). The fill, focus ring and disabled state stay the default
button's. Today the set holds \`ado\` (\`--ado-base\`), used by the Needs-you row action.

Other button types ignore \`textColor\`. It takes precedence over the deprecated \`color\` / \`hoverColor\`.
`;

// Rest, focus and disabled for the ado text colour, next to the plain default button
export const ButtonDefaultTextColor: ButtonStory = {
  globals: { theme: 'light' },
  args: { onClick: fn() },
  parameters: { docs: { description: { story: textColorDescription } } },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {SURFACES.slice(0, 2).map((surface) => (
        <Row key={surface.key} label={surface.label} background={surface.background}>
          <Button type={ButtonTypes.default} onClick={args.onClick} testId={`text-color-${surface.key}-plain`}>
            Default
          </Button>
          <Button
            type={ButtonTypes.default}
            textColor={ButtonTextColors.ado}
            onClick={args.onClick}
            testId={`text-color-${surface.key}-ado`}
          >
            Ado
          </Button>
          <Button
            type={ButtonTypes.default}
            textColor={ButtonTextColors.ado}
            size={ButtonSizes.small}
            icon={IconNames.caretLeft}
            iconPosition="right"
            onClick={args.onClick}
            testId={`text-color-${surface.key}-row-action`}
          >
            Review
          </Button>
          <Button
            type={ButtonTypes.default}
            textColor={ButtonTextColors.ado}
            disabled
            onClick={args.onClick}
            testId={`text-color-${surface.key}-disabled`}
          >
            Disabled
          </Button>
        </Row>
      ))}
      <Row label="Ignored by other types" background="#ffffff">
        <Button
          type={ButtonTypes.primary}
          textColor={ButtonTextColors.ado}
          onClick={args.onClick}
          testId="text-color-primary-ignored"
        >
          Primary
        </Button>
      </Row>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = (testId: string) => canvas.getByTestId(`${testId}_button`);

    // ado colours the label at rest, the plain default keeps its own colour
    const ado = button('text-color-white-ado');
    await expect(ado.className).toMatch(/text-color-ado/);
    await expect(getComputedStyle(getLabel(ado)!).color).toBe(ADO_BASE);
    await expect(getComputedStyle(getLabel(button('text-color-white-plain'))!).color).not.toBe(ADO_BASE);

    // the icon (loaded async) follows the label
    const rowAction = button('text-color-white-row-action');
    await waitFor(() => expect(getIconSvg(rowAction)).not.toBeNull());
    await expect(getComputedStyle(getIconSvg(rowAction)!).color).toBe(ADO_BASE);

    // hover/focus use a colour derived from the rest colour, darker than it
    const hoverColor = getComputedStyle(ado).getPropertyValue('--default-text-hover-color');
    const probe = document.createElement('span');
    probe.style.color = hoverColor;
    canvasElement.appendChild(probe);
    const resolvedHover = getComputedStyle(probe).color;
    probe.remove();
    await expect(hoverColor).toContain('color-mix');
    await expect(resolvedHover).not.toBe(ADO_BASE);
    // :focus only matches while the document has focus (not in a hidden preview)
    if (document.hasFocus()) {
      ado.focus();
      await waitFor(() => expect(getComputedStyle(getLabel(ado)!).color).toBe(resolvedHover));
      ado.blur();
    }

    // disabled keeps the default button's disabled look
    const disabled = button('text-color-white-disabled');
    await expect(disabled).toBeDisabled();
    await expect(getComputedStyle(getLabel(disabled)!).color).not.toBe(ADO_BASE);

    // other types ignore textColor
    const primary = button('text-color-primary-ignored');
    await expect(primary.className).not.toMatch(/text-color-ado/);
    await expect(getComputedStyle(getLabel(primary)!).color).not.toBe(ADO_BASE);
  },
};

const previewDescription = `
**Preview, not the shipped look.** The default button reads its fill from the theme
(\`--button-default-background-color\`, \`--button-default-hover-background-color\`). VAN-85 asks the webapp theme
generator to change them to \`transparent\` and \`rgba(185, 197, 216, 0.12)\`. This story sets those two values on a
wrapper to show the result on white, grey and tinted surfaces. Hover a button to see the translucent hover fill.
`;

// The default button with the VAN-85 theme values, scoped to this story
export const ButtonDefaultTransparentPreview: ButtonStory = {
  globals: { theme: 'light' },
  args: { onClick: fn() },
  parameters: { docs: { description: { story: previewDescription } } },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', ...TRANSPARENT_DEFAULT_THEME }}>
      {SURFACES.map((surface) => (
        <Row key={surface.key} label={surface.label} background={surface.background}>
          <Button type={ButtonTypes.default} onClick={args.onClick} testId={`preview-${surface.key}-plain`}>
            Default
          </Button>
          <Button type={ButtonTypes.default} icon={IconNames.add} onClick={args.onClick}>
            With icon
          </Button>
          <Button
            type={ButtonTypes.default}
            textColor={ButtonTextColors.ado}
            size={ButtonSizes.small}
            icon={IconNames.caretLeft}
            iconPosition="right"
            onClick={args.onClick}
          >
            Review
          </Button>
          <Button type={ButtonTypes.default} disabled onClick={args.onClick}>
            Disabled
          </Button>
        </Row>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // with the requested theme values the rest fill is transparent on every surface
    for (const surface of SURFACES) {
      const button = canvas.getByTestId(`preview-${surface.key}-plain_button`);
      await expect(getComputedStyle(button).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    }
  },
};
