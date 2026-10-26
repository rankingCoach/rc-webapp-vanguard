import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { expect } from 'storybook/test';

import { Button, ButtonProps, ButtonSizes, ButtonTypes } from '../Button';
import styles from '../Button.module.scss';
import { ButtonStory } from './_Button.default';

const TYPES = [ButtonTypes.default, ButtonTypes.primary, ButtonTypes.secondary, ButtonTypes.shimmer, ButtonTypes.muted];
const SIZES = [ButtonSizes.small, ButtonSizes.medium, ButtonSizes.large, ButtonSizes.extraLarge] as const;

// Height (mobile / desktop) and label size per size, the same for every type
export const EXPECTED: Record<ButtonSizes, { mobile: number; desktop: number; text: number }> = {
  [ButtonSizes.small]: { mobile: 32, desktop: 24, text: 12 },
  [ButtonSizes.medium]: { mobile: 40, desktop: 32, text: 12 },
  [ButtonSizes.large]: { mobile: 40, desktop: 40, text: 14 },
  [ButtonSizes.extraLarge]: { mobile: 40, desktop: 48, text: 16 },
};

const description = `
Every type shares one size set, so the same \`size\` gives the same footprint whatever the \`type\`.

| size | height (mobile / desktop) | text |
| --- | --- | --- |
| \`small\` | 32 / 24px | 12px |
| \`medium\` (default) | 40 / 32px | 12px |
| \`large\` | 40 / 40px | 14px |
| \`extraLarge\` | 40 / 48px | 16px |

**Migrating from the pre-2.7 sizes:** default, primary, secondary and shimmer used to be bigger. Bump them one step to keep their
footprint: \`small\` → \`medium\`, \`medium\` (or no size) → \`extraLarge\`, \`large\` → \`extraLarge\` (60 → 48px desktop,
48 → 40px mobile). Muted buttons keep their size.
`;

const id = (type: ButtonTypes, size: ButtonSizes, variant: string) => `matrix-${type}-${size}-${variant}`;

// Each row mixes every type at one size, label and icon-left
export const ButtonSizeMatrix: ButtonStory = {
  name: 'Size Matrix',
  parameters: { docs: { description: { story: description } } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ minWidth: '96px', fontSize: '14px', fontWeight: 500 }}>{size}</span>
          {TYPES.map((type) =>
            [
              { key: 'label', props: {} },
              { key: 'icon', props: { icon: IconNames.add } },
            ].map((variant) => (
              <Button
                key={`${type}-${variant.key}`}
                {...({ type, size, ...variant.props } as ButtonProps)}
                testId={id(type, size, variant.key)}
              >
                {type}
              </Button>
            )),
          )}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // mobile is 767px and below
    const breakpoint = window.innerWidth > 767 ? 'desktop' : 'mobile';
    const getButton = (testId: string) =>
      canvasElement.querySelector<HTMLButtonElement>(`[data-testid="${testId}"] button`)!;

    for (const size of SIZES) {
      for (const type of TYPES) {
        for (const variant of ['label', 'icon']) {
          const button = getButton(id(type, size, variant));
          await expect(Math.round(button.getBoundingClientRect().height)).toBe(EXPECTED[size][breakpoint]);

          const text = button.querySelector<HTMLElement>(`.${styles.buttonText}`)!;
          await expect(getComputedStyle(text).fontSize).toBe(`${EXPECTED[size].text}px`);
        }
      }
    }
  },
};
