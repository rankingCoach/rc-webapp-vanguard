import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { expect } from 'storybook/test';

import { Button, ButtonProps, ButtonSizes, ButtonTypes } from '../Button';
import styles from '../Button.module.scss';
import { Surface } from './_mutedSurfaces';
import { EXPECTED } from './ButtonSizeMatrix.story';
import { ButtonStory } from './_Button.default';

// Diacritics above the cap height (Î, Ä) and below the baseline (Ș, Ț), plus descenders
const LABEL = 'Încarcă gjpy ȘȚÄ';

const SIZES = [ButtonSizes.small, ButtonSizes.medium, ButtonSizes.large, ButtonSizes.extraLarge] as const;

type Variant = { key: string; props: Partial<ButtonProps> };

const LIGHT_VARIANTS: Variant[] = [
  { key: 'default', props: { type: ButtonTypes.default } },
  { key: 'primary', props: { type: ButtonTypes.primary } },
  { key: 'secondary', props: { type: ButtonTypes.secondary } },
  { key: 'shimmer', props: { type: ButtonTypes.shimmer } },
  { key: 'muted', props: { type: ButtonTypes.muted } },
  { key: 'muted-blurred', props: { type: ButtonTypes.muted, blurred: true } },
  { key: 'primary-icon', props: { type: ButtonTypes.primary, icon: IconNames.add } },
  { key: 'primary-wrap', props: { type: ButtonTypes.primary, textWrap: 'wrap' } },
  { key: 'muted-wrap', props: { type: ButtonTypes.muted, textWrap: 'wrap' } },
];

const DARK_VARIANTS: Variant[] = [
  { key: 'primary-inverted', props: { type: ButtonTypes.primary, inverted: true } },
  { key: 'shimmer-inverted', props: { type: ButtonTypes.shimmer, inverted: true } },
  { key: 'muted-on-dark', props: { type: ButtonTypes.muted, onDark: true } },
  { key: 'muted-inverted', props: { type: ButtonTypes.muted, inverted: true } },
  { key: 'muted-inverted-on-dark', props: { type: ButtonTypes.muted, inverted: true, onDark: true } },
  { key: 'muted-inverted-blurred', props: { type: ButtonTypes.muted, inverted: true, blurred: true } },
];

const id = (size: ButtonSizes, variant: string) => `glyphs-${size}-${variant}`;

const renderVariant = (size: ButtonSizes, variant: Variant) => (
  <Button key={variant.key} {...({ size, ...variant.props } as ButtonProps)} testId={id(size, variant.key)}>
    {LABEL}
  </Button>
);

// The ink of the label (its tallest and deepest glyphs) must sit inside the label's clip box
const inkOverflow = (text: HTMLElement) => {
  const style = getComputedStyle(text);
  const context = document.createElement('canvas').getContext('2d')!;
  context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const metrics = context.measureText(text.textContent ?? '');

  const range = document.createRange();
  range.selectNodeContents(text);
  const lines = range.getClientRects();
  const inkTop = lines[0].top + metrics.fontBoundingBoxAscent - metrics.actualBoundingBoxAscent;
  const inkBottom = lines[lines.length - 1].bottom - metrics.fontBoundingBoxDescent + metrics.actualBoundingBoxDescent;

  const box = text.getBoundingClientRect();
  return { top: box.top - inkTop, bottom: inkBottom - box.bottom };
};

// Tests that ascenders, descenders and diacritics are never clipped, for every type and size, without changing the height
export const ButtonLabelGlyphs: ButtonStory = {
  name: 'Label Glyphs',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{size}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {LIGHT_VARIANTS.map((variant) => renderVariant(size, variant))}
          </div>
          <Surface surface="teal" showCaption={false}>
            {DARK_VARIANTS.map((variant) => renderVariant(size, variant))}
          </Surface>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // The glyph extents depend on the font: make sure the theme's Inter is the one measured, not a system fallback
    // (document.fonts.check() can't tell, it is true when no @font-face matches)
    await document.fonts.load('500 16px Inter');
    const isInterLoaded = [...document.fonts].some(
      (face) => face.family.replace(/"/g, '') === 'Inter' && face.status === 'loaded',
    );
    await expect(isInterLoaded).toBe(true);
    // mobile is 767px and below
    const breakpoint = window.innerWidth > 767 ? 'desktop' : 'mobile';

    for (const size of SIZES) {
      for (const variant of [...LIGHT_VARIANTS, ...DARK_VARIANTS]) {
        const testId = id(size, variant.key);
        const button = canvasElement.querySelector<HTMLButtonElement>(`[data-testid="${testId}"] button`)!;
        const text = button.querySelector<HTMLElement>(`.${styles.buttonText}`)!;

        // Same height as without the glyph room
        await expect(Math.round(button.getBoundingClientRect().height), testId).toBe(EXPECTED[size][breakpoint]);

        // Nothing overflows the label's clip box
        await expect(text.scrollHeight, testId).toBeLessThanOrEqual(text.clientHeight);
        const overflow = inkOverflow(text);
        await expect(overflow.top, `${testId} top`).toBeLessThanOrEqual(0);
        await expect(overflow.bottom, `${testId} bottom`).toBeLessThanOrEqual(0);
      }
    }
  },
};
