import { StoryObj } from '@storybook/react';

import { Switch } from '../Switch';

export type SwitchStory = StoryObj<typeof Switch>;

export const SWITCH_EXCLUDED_CONTROLS_DEFAULT = [
  'labelClassName',
  'onChange',
  'labelReplacements',
  'className',
  'testId',
  'childrenWidth',
  'labelColor',
  'labelType',
  'labelFontWeight',
];

export const switchArgTypes = {
  value: {
    control: 'boolean',
    defaultValue: false,
  },
  size: {
    control: 'radio',
    options: ['small', 'big'],
    defaultValue: 'small',
  },
  labelPos: {
    control: 'radio',
    options: ['left', 'right'],
    defaultValue: 'right',
  },
  disabled: {
    control: 'boolean',
    defaultValue: false,
  },
  loading: {
    control: 'boolean',
    defaultValue: false,
  },
  readOnly: {
    control: 'boolean',
    defaultValue: false,
  },
};
