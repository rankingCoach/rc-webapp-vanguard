import React from 'react';
import { expect, waitFor } from 'storybook/test';

import { ButtonTypes, MutedButtonProps } from '../Button';

const PHOTO_URL =
  'https://plus.unsplash.com/premium_photo-1666580543682-c70e62b3d337?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

export type MutedSurfaceKey = 'white' | 'pale' | 'teal' | 'dark' | 'photo' | 'warm';

export type MutedSurfaceDef = { label: string; background: string; photo?: boolean };

// Surfaces the muted button is designed to sit on. The Backgrounds addon is disabled in this Storybook,
// so every story paints its own surface.
export const MUTED_SURFACES: Record<MutedSurfaceKey, MutedSurfaceDef> = {
  white: { label: 'White #fff', background: '#ffffff' },
  pale: { label: 'Pale ripple', background: 'linear-gradient(120deg, #eef9fe, #f3fcff 45%, #e7f6ef)' },
  teal: { label: 'Mid teal #00495d (Ado bubble)', background: '#00495d' },
  dark: { label: 'Dark #0e141b', background: '#0e141b' },
  photo: {
    label: 'Photo',
    background: `url('${PHOTO_URL}')`,
    photo: true,
  },
  warm: { label: 'Warm dark gradient', background: 'linear-gradient(135deg, #3b1f12, #7a3b1d 55%, #1d0f0a)' },
};

export const MUTED_SURFACE_KEYS = Object.keys(MUTED_SURFACES) as MutedSurfaceKey[];

type SurfaceProps = {
  surface: MutedSurfaceKey;
  caption?: string;
  /** Show the caption above the content (default) */
  showCaption?: boolean;
  testId?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

// Paints a surface behind the buttons, with an optional caption
export const Surface = ({ surface, caption, showCaption = true, testId, style, children }: SurfaceProps) => {
  const def = MUTED_SURFACES[surface];
  const isDarkSurface = surface === 'teal' || surface === 'dark' || surface === 'warm' || surface === 'photo';
  return (
    <div
      data-testid={testId}
      style={{
        background: def.background,
        backgroundSize: def.photo ? 'cover' : undefined,
        backgroundPosition: def.photo ? 'left' : undefined,
        padding: '16px 24px',
        borderRadius: '12px',
        border: surface === 'white' ? '1px solid #e3e8ef' : undefined,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        ...style,
      }}
    >
      {showCaption ? (
        <span style={{ fontSize: '12px', fontWeight: 500, color: isDarkSurface ? '#ffffff' : '#263349' }}>
          {caption ?? def.label}
        </span>
      ) : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>{children}</div>
    </div>
  );
};

export const FG_DARK = 'rgb(38, 51, 73)';
export const FG_WHITE = 'rgb(255, 255, 255)';
export const RING_BLUE = 'rgb(0, 98, 255)';
export const RING_WHITE = 'rgb(255, 255, 255)';

export type MutedComboKey = 'default' | 'onDark' | 'inverted' | 'invertedOnDark';

export type MutedCombo = {
  key: MutedComboKey;
  label: string;
  props: Pick<MutedButtonProps, 'type' | 'inverted' | 'onDark'>;
  fg: string;
  ring: string;
  blend: 'multiply' | 'plus-lighter';
  /** The surface this combination is designed for */
  surface: MutedSurfaceKey;
};

export const MUTED_COMBOS: MutedCombo[] = [
  {
    key: 'default',
    label: 'default',
    props: { type: ButtonTypes.muted },
    fg: FG_DARK,
    ring: RING_BLUE,
    blend: 'multiply',
    surface: 'pale',
  },
  {
    key: 'onDark',
    label: 'onDark',
    props: { type: ButtonTypes.muted, onDark: true },
    fg: FG_WHITE,
    ring: RING_WHITE,
    blend: 'multiply',
    surface: 'teal',
  },
  {
    key: 'inverted',
    label: 'inverted',
    props: { type: ButtonTypes.muted, inverted: true },
    fg: FG_WHITE,
    ring: RING_WHITE,
    blend: 'plus-lighter',
    surface: 'photo',
  },
  {
    key: 'invertedOnDark',
    label: 'inverted + onDark',
    props: { type: ButtonTypes.muted, inverted: true, onDark: true },
    fg: FG_DARK,
    ring: RING_BLUE,
    blend: 'plus-lighter',
    surface: 'pale',
  },
];

export const comboButtonProps = (combo: MutedCombo, extra: Partial<MutedButtonProps> = {}): MutedButtonProps =>
  ({ ...combo.props, ...extra }) as MutedButtonProps;

export const getButtonByTestId = (root: HTMLElement, testId: string): HTMLButtonElement => {
  const el = root.querySelector<HTMLButtonElement>(`[data-testid="${testId}_button"]`);
  if (!el) {
    throw new Error(`Button "${testId}_button" not found`);
  }
  return el;
};

// Computed style of the button's blur layer (::before) or fill layer (::after)
export const getLayerStyle = (button: HTMLElement, layer: '::before' | '::after'): CSSStyleDeclaration =>
  getComputedStyle(button, layer);

// Alpha channel of a computed colour (handles rgb(), rgba() and color(srgb ... / a))
export const getAlpha = (color: string): number => {
  const slash = color.match(/\/\s*([\d.]+%?)\s*\)/);
  if (slash) {
    return slash[1].endsWith('%') ? parseFloat(slash[1]) / 100 : parseFloat(slash[1]);
  }
  const rgba = color.match(/^rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)$/);
  if (rgba) {
    return parseFloat(rgba[1]);
  }
  return 1;
};

export const getFillAlpha = (button: HTMLElement): number => getAlpha(getLayerStyle(button, '::after').backgroundColor);

// The button element must never create an isolated blend group: blending happens on ::after only
export const expectNotIsolated = async (button: HTMLElement) => {
  const style = getComputedStyle(button);
  await expect(style.mixBlendMode).toBe('normal');
  await expect(style.opacity).toBe('1');
  await expect(style.backdropFilter).toBe('none');
  await expect(style.filter).toBe('none');
  await expect(style.isolation).toBe('auto');
  await expect(style.zIndex).toBe('auto');
  await expect(style.transform).toBe('none');
};

// The label element (.button-text) of a button
export const getLabel = (button: HTMLElement): HTMLElement => {
  const el = button.querySelector<HTMLElement>('[class*="button-text"], [class*="buttonText"]');
  if (!el) {
    throw new Error('Button label not found');
  }
  return el;
};

// Fill of the first <path> of an icon rendered inside the button
export const getIconPathFill = (button: HTMLElement): string => {
  const path = button.querySelector<SVGPathElement>('[data-testid$="_icon"] svg path, svg path');
  if (!path) {
    throw new Error('Icon path not found');
  }
  return getComputedStyle(path).fill;
};

// Label colour, and the icon path fill when the button has an icon
export const expectForeground = async (button: HTMLElement, fg: string, withIcon = false) => {
  await expect(getComputedStyle(button).color).toBe(fg);
  await expect(getComputedStyle(getLabel(button)).color).toBe(fg);
  if (withIcon) {
    await expect(getIconPathFill(button)).toBe(fg);
  }
};

// Foreground colour, blend mode of the fill layer, and a non-isolated button
export const expectMutedSurface = async (button: HTMLElement, { fg, blend }: { fg: string; blend: string }) => {
  await expect(getComputedStyle(button).color).toBe(fg);
  await expect(getLayerStyle(button, '::after').mixBlendMode).toBe(blend);
  await expectNotIsolated(button);
};

// Icons are loaded lazily: wait until `count` icons are rendered with a size
export const waitForIcons = async (root: HTMLElement, count: number) => {
  await waitFor(
    () => {
      const icons = Array.from(root.querySelectorAll<HTMLElement>('[data-testid$="_icon"]'));
      expect(icons).toHaveLength(count);
      icons.forEach((icon) => expect(icon.offsetWidth).toBeGreaterThan(0));
    },
    { timeout: 5000 },
  );
};
