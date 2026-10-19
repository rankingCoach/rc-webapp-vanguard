import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  barRootOf,
  makeTabs,
  resolvedVarColor,
  sampleLabels,
  Story,
  VisualHarness,
  wrapperOf,
} from './_TabsVisual.default';

export const ConfigFloating: Story = {
  render: () => <VisualHarness tabs={makeTabs(sampleLabels)} tabConfig={{ theme: 'floating' }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole('tablist');
    const tabs = canvas.getAllByRole('tab');

    tabs.forEach((tab) => {
      const style = getComputedStyle(tab);
      expect(style.borderRadius).toBe('24px');
      expect(style.flexGrow).toBe('0');
      expect(style.minHeight).toBe('0px');
      expect(style.paddingTop).toBe('8px');
      expect(style.paddingLeft).toBe('16px');
    });

    // The selected fill is drawn by the sliding indicator, not by the tab.
    await expect(getComputedStyle(tabs[0], '::before').opacity).toBe('0');

    // A single indicator sits under the selected tab, filled with the muted inverted hover/pressed token.
    const indicatorOf = () => tablist.querySelector(':scope > [aria-hidden="true"]') as HTMLElement;
    const expectIndicatorOn = (tab: HTMLElement) => {
      const indicatorRect = indicatorOf().getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      expect(Math.abs(indicatorRect.left - tabRect.left)).toBeLessThan(1);
      expect(Math.abs(indicatorRect.width - tabRect.width)).toBeLessThan(1);
    };
    await expect(indicatorOf()).toBeTruthy();
    await expect(getComputedStyle(indicatorOf()).backgroundColor).toBe(
      resolvedVarColor('--button-muted-inverted-on-dark-background-color'),
    );
    expectIndicatorOn(tabs[0]);

    const bar = barRootOf(tablist);
    const barStyle = getComputedStyle(bar);
    await expect(barStyle.borderRadius).toBe('26px');
    await expect(barStyle.minHeight).toBe('0px');
    await expect(barStyle.paddingTop).toBe('2px');
    await expect(barStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');

    // Pill hugs its content instead of stretching across the wrapper.
    const wrapper = wrapperOf(tablist);
    await expect(bar.getBoundingClientRect().width).toBeLessThan(wrapper.getBoundingClientRect().width - 50);

    // Selected label is NOT emphasised in the floating theme.
    const selectedLabel = canvas.getByText(sampleLabels[0]);
    const labelStyle = getComputedStyle(selectedLabel);
    await expect(labelStyle.fontWeight).toBe('400');
    await expect(labelStyle.color).toBe(resolvedVarColor('--button-muted-inverted-on-dark-text-color'));

    // Unselected tabs are plain muted buttons: muted text, muted rest fill and blend.
    await expect(getComputedStyle(canvas.getByText(sampleLabels[1])).color).toBe(
      resolvedVarColor('--button-muted-text-color'),
    );
    const unselectedFill = getComputedStyle(tabs[1], '::before');
    await expect(unselectedFill.backgroundColor).toBe(resolvedVarColor('--button-muted-background-color'));
    await expect(unselectedFill.mixBlendMode).toBe('multiply');

    // Selecting another tab glides the indicator over to it, squishing on the way.
    await userEvent.click(tabs[2]);
    const indicator = indicatorOf();
    await waitFor(() => expect(indicator.getAnimations().length).toBeGreaterThanOrEqual(2));

    // Mid-glide the squish scales the chip around its own centre: its offset in the bar must not shrink with it.
    const animations = indicator.getAnimations();
    animations.forEach((animation) => {
      animation.pause();
      const { duration } = animation.effect?.getComputedTiming() ?? {};
      animation.currentTime = Number(duration) / 2;
    });
    const centerX = () => {
      const rect = indicator.getBoundingClientRect();
      return rect.left + rect.width / 2;
    };
    await expect(getComputedStyle(indicator).scale).not.toBe('none');
    const squishedCenter = centerX();
    // The squish is the script animation; the glide itself is made of CSS transitions.
    animations.filter((animation) => !(animation instanceof CSSTransition)).forEach((squish) => squish.cancel());
    await expect(getComputedStyle(indicator).scale).toBe('none');
    await expect(Math.abs(squishedCenter - centerX())).toBeLessThan(1);
    animations.forEach((animation) => animation.finish());
    await waitFor(() => expectIndicatorOn(tabs[2]), { timeout: 2000 });

    // Flipping the direction moves the tabs without resizing them; the indicator follows.
    wrapper.setAttribute('dir', 'rtl');
    try {
      await waitFor(() => expectIndicatorOn(tabs[2]), { timeout: 2000 });
    } finally {
      wrapper.removeAttribute('dir');
    }
  },
};
