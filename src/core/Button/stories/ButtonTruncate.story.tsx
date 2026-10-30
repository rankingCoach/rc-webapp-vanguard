import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';

import { Button, ButtonProps, ButtonSizes, ButtonTypes } from '../Button';
import { ButtonStory } from './_Button.default';

const LONG_LABEL = 'Review the 12 new customer reviews waiting for an answer';
// A 375px phone minus the 16px side gutters
const PHONE_WIDTH = 343;

const getLabel = (button: HTMLElement) => button.querySelector('.rc-text') as HTMLElement;
const isTruncated = (label: HTMLElement) => label.scrollWidth > label.clientWidth;

const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px' };

// Tests that long labels truncate with an ellipsis inside a phone-width container, and short labels stay whole
export const ButtonTruncate: ButtonStory = {
  args: {
    children: LONG_LABEL,
    onClick: fn(),
  },
  render: (props) => (
    <div
      data-testid="phone"
      style={{
        width: `${PHONE_WIDTH}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        outline: 'dotted 2px blue',
      }}
    >
      {/* Block parent */}
      <div>
        <Button {...({ ...props, type: ButtonTypes.primary } as ButtonProps)} testId="block" />
      </div>
      {/* Row action: alone in a flex row, with an icon */}
      <div style={rowStyle}>
        <Button
          {...({ ...props, type: ButtonTypes.secondary } as ButtonProps)}
          icon={IconNames.add}
          iconPosition="left"
          testId="row-icon"
        />
      </div>
      {/* Muted row action */}
      <div style={rowStyle}>
        <Button {...props} type={ButtonTypes.muted} size={ButtonSizes.small} icon={IconNames.add} testId="row-muted" />
      </div>
      {/* Short label next to row text that wraps: the button keeps its whole label */}
      <div style={rowStyle}>
        <span>A row title long enough to wrap onto a couple of lines on a phone</span>
        <Button {...({ ...props, type: ButtonTypes.default } as ButtonProps)} testId="row-short">
          Edit
        </Button>
      </div>
      {/* Short-label references for the icon size */}
      <div style={rowStyle}>
        <Button
          {...({ ...props, type: ButtonTypes.secondary } as ButtonProps)}
          icon={IconNames.add}
          iconPosition="left"
          testId="ref-icon"
        >
          Add
        </Button>
        <Button {...props} type={ButtonTypes.muted} size={ButtonSizes.small} icon={IconNames.add} testId="ref-muted">
          Add
        </Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const phone = canvas.getByTestId('phone').getBoundingClientRect();

    // Icons are loaded lazily: wait for them to be rendered before measuring the layout
    const iconIds = ['row-icon', 'row-muted', 'ref-icon', 'ref-muted'];
    const icons = await Promise.all(iconIds.map((testId) => canvas.findByTestId(`${testId}_icon`)));
    await waitFor(() => icons.forEach((icon) => expect(icon.getBoundingClientRect().width).toBeGreaterThan(0)));
    const iconWidth = (index: number) => icons[index].getBoundingClientRect().width;

    for (const testId of ['block', 'row-icon', 'row-muted']) {
      const button = canvas.getByTestId(`${testId}_button`);
      const label = getLabel(button);

      // The button stays within the phone width and the label ends with an ellipsis
      await expect(button.getBoundingClientRect().right, testId).toBeLessThanOrEqual(phone.right);
      await expect(isTruncated(label), testId).toBe(true);
      await expect(getComputedStyle(label).textOverflow, testId).toBe('ellipsis');
      await expect(label.getBoundingClientRect().width, testId).toBeGreaterThan(0);
    }

    // The icons keep the size they have next to a short label: only the label gives way
    await expect(iconWidth(0)).toBeCloseTo(iconWidth(2), 1);
    await expect(iconWidth(1)).toBeCloseTo(iconWidth(3), 1);

    // A short label next to wrapping text is not truncated
    await expect(isTruncated(getLabel(canvas.getByTestId('row-short_button')))).toBe(false);
  },
};
