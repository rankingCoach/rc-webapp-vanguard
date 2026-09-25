import { IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';

import { Button, ButtonProps, ButtonSizes, ButtonTypes } from '../Button';
import { ButtonStory } from './_Button.default';

const LONG_LABEL = 'Very long button label that should wrap onto multiple lines';
const CONTAINER_WIDTH = 220;

const getLabel = (button: HTMLElement) => button.querySelector('.rc-text') as HTMLElement;
const getLineHeight = (element: HTMLElement) => parseFloat(getComputedStyle(element).lineHeight);

// Tests that a long label wraps inside a narrow container when textWrap="wrap"
export const ButtonTextWrap: ButtonStory = {
  args: {
    type: ButtonTypes.primary,
    children: LONG_LABEL,
    textWrap: 'wrap',
    testId: 'button-text-wrap',
    onClick: fn(),
  },
  render: (props) => (
    <div data-testid="wrap-container" style={{ width: `${CONTAINER_WIDTH}px`, outline: 'dotted 2px blue' }}>
      <Button {...props} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('wrap-container');
    const button = canvas.getByRole('button', { name: LONG_LABEL });
    const label = getLabel(button);

    // The label spans more than one line
    await expect(label.getBoundingClientRect().height).toBeGreaterThan(getLineHeight(label) * 1.5);

    // The button stays within its container
    await expect(button.getBoundingClientRect().width).toBeLessThanOrEqual(container.getBoundingClientRect().width);

    // The whole label is visible (nothing clipped by the button)
    await expect(button.scrollHeight).toBeLessThanOrEqual(button.clientHeight);
    await expect(button.getBoundingClientRect().bottom).toBeGreaterThanOrEqual(label.getBoundingClientRect().bottom);
  },
};

// Tests that the icon keeps its size while the label wraps next to it
export const ButtonTextWrapWithIcon: ButtonStory = {
  args: {
    ...ButtonTextWrap.args,
    icon: IconNames.add,
    iconPosition: 'left',
    testId: 'button-text-wrap-icon',
  },
  render: ButtonTextWrap.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Icons are loaded lazily: wait for it to be rendered before measuring the layout
    const icon = await canvas.findByTestId('button-text-wrap-icon_icon');
    await waitFor(() => expect(icon.getBoundingClientRect().width).toBeGreaterThan(0));
    const container = canvas.getByTestId('wrap-container');
    const button = canvas.getByRole('button', { name: LONG_LABEL });
    const label = getLabel(button);

    await expect(label.getBoundingClientRect().height).toBeGreaterThan(getLineHeight(label) * 1.5);
    await expect(button.getBoundingClientRect().width).toBeLessThanOrEqual(container.getBoundingClientRect().width);
  },
};

const typeSizeMatrix: Array<Pick<ButtonProps, 'type' | 'size'>> = [
  ...[ButtonTypes.primary, ButtonTypes.secondary, ButtonTypes.default, ButtonTypes.shimmer].flatMap((type) =>
    [ButtonSizes.small, ButtonSizes.medium, ButtonSizes.large].map((size) => ({ type, size }) as ButtonProps),
  ),
  ...[ButtonSizes.small, ButtonSizes.medium, ButtonSizes.large, ButtonSizes.extraLarge].map(
    (size) => ({ type: ButtonTypes.muted, size }) as ButtonProps,
  ),
];

// Button variants rendered for every type & size; iconCount is the number of icons each variant renders
const variants: Array<{ name: string; props: Partial<ButtonProps>; iconCount: number }> = [
  { name: 'plain', props: {}, iconCount: 0 },
  { name: 'icon-left', props: { icon: IconNames.add }, iconCount: 1 },
  { name: 'icon-right', props: { icon: IconNames.add, iconPosition: 'right' }, iconCount: 1 },
  { name: 'icon-circle', props: { icon: IconNames.add, iconHasCircle: true }, iconCount: 1 },
  { name: 'icon-only', props: { icon: IconNames.add, children: undefined }, iconCount: 1 },
  { name: 'loading', props: { isLoading: true }, iconCount: 1 },
  { name: 'disabled', props: { disabled: true }, iconCount: 0 },
  { name: 'rounded', props: { rounded: true }, iconCount: 0 },
  { name: 'uppercase', props: { uppercase: true }, iconCount: 0 },
  { name: 'icon-large', props: { icon: IconNames.add, iconSize: IconSize.large }, iconCount: 1 },
  { name: 'icon-large-on-hover', props: { icon: IconNames.add, iconLargeOnHover: true }, iconCount: 2 },
];

// Tests that a short label renders identically with and without textWrap="wrap", for every type, size & variant
export const ButtonTextWrapShortLabelUnchanged: ButtonStory = {
  args: {
    onClick: fn(),
  },
  render: (props) => (
    <div style={{ display: 'grid', gap: '16px' }}>
      {typeSizeMatrix.flatMap(({ type, size }) =>
        variants.map((variant) => {
          const id = `${type}-${size}-${variant.name}`;
          const buttonProps = { children: 'Short', ...props, type, size, ...variant.props } as ButtonProps;
          return (
            <div key={id} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' }}>
              <Button {...buttonProps} testId={`${id}-default`} />
              <Button {...buttonProps} testId={`${id}-wrap`} textWrap="wrap" />
            </div>
          );
        }),
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rect = (testId: string) => canvas.getByTestId(`${testId}_button`).getBoundingClientRect();

    // Icons are loaded lazily: wait for all of them to be rendered before measuring the layout
    const expectedIcons = typeSizeMatrix.length * variants.reduce((sum, { iconCount }) => sum + iconCount, 0) * 2;
    await waitFor(
      () => {
        const icons = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-testid$="_icon"]'));
        expect(icons).toHaveLength(expectedIcons);
        icons.forEach((icon) => expect(icon.offsetWidth).toBeGreaterThan(0));
      },
      { timeout: 5000 },
    );

    for (const { type, size } of typeSizeMatrix) {
      for (const variant of variants) {
        const id = `${type}-${size}-${variant.name}`;
        const [defaultRect, wrapRect] = [rect(`${id}-default`), rect(`${id}-wrap`)];
        await expect(wrapRect.height, `${id} height`).toBeCloseTo(defaultRect.height, 0);
        await expect(wrapRect.width, `${id} width`).toBeCloseTo(defaultRect.width, 0);
      }
    }
  },
};
