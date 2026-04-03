import React from 'react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { MenuItem, MenuItemProps } from '@vanguard/MenuItem/MenuItem';
import { IconNames } from '@vanguard/Icon/IconNames';
import { TextTypes } from '@vanguard/Text/Text';
import { StoryObj } from '@storybook/react';

export default {
  ...SbDecorator({
    title: 'vanguard/MenuItem',
    component: MenuItem,
  }),
};

type Story = StoryObj<typeof MenuItem>;

export const Default: Story = {
  args: {
    children: 'Menu Item',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Item',
    disabled: true,
  },
};

export const Selected: Story = {
  args: {
    children: 'Selected Item',
    selected: true,
  },
};

export const Dense: Story = {
  args: {
    children: 'Dense Item',
    dense: true,
  },
};

export const WithDivider: Story = {
  args: {
    children: 'Item with Divider',
    divider: true,
  },
};

export const WithIconBefore: Story = {
  args: {
    children: 'Edit',
    icon: IconNames.edit,
    iconPosition: 'before',
  },
};

export const WithIconAfter: Story = {
  args: {
    children: 'Delete',
    icon: IconNames.remove,
    iconPosition: 'after',
  },
};

export const WithHeadingText: Story = {
  args: {
    children: 'Section Header',
    textType: TextTypes.heading4,
  },
};

export const WithCaptionText: Story = {
  args: {
    children: 'Helper note',
    textType: TextTypes.textCaption,
  },
};
