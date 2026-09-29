import { StoryObj } from '@storybook/react';
import { IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React, { useEffect, useState } from 'react';

import { Button, ButtonProps, ButtonSizes, ButtonTypes } from '../Button';

// Required Story type export
export type ButtonStory = StoryObj<typeof Button>;

// Test utilities
export const waitForDebounce = (ms: number = 100) => new Promise((resolve) => setTimeout(resolve, ms));

// Test data constants
export const testIcons = {
  add: IconNames.add,
  save: IconNames.save,
  close: IconNames.close,
  settings: IconNames.settings,
} as const;

export const testColors = {
  primary: '#007bff',
  secondary: '#6c757d',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
} as const;

// Common selectors
export const selectors = {
  button: 'button[data-testid*="button"]',
  buttonContainer: '[data-testid*="button"]',
  disabledButton: 'button[disabled]',
} as const;

// Excluded controls for Storybook
export const BUTTONS_EXCLUDED_CONTROLS_DEFAULT = [
  'testId',
  'className',
  'targetRef',
  'w100',
  'debounce',
  'replacements',
  'blurred',
  'inverted',
];
export const BUTTONS_EXCLUDED_CONTROLS_MUTED = ['testId', 'className', 'targetRef', 'w100', 'debounce', 'replacements'];

// Button type options (excluding muted for base buttons)
export const { muted, ...BaseButtonTypeOptions } = ButtonTypes;
export const { extraLarge, ...BaseButtonSizeOptions } = ButtonSizes;

// Storybook argTypes configuration for common controls
export const buttonArgTypes = {
  rounded: {
    control: 'boolean',
    defaultValue: false,
  },
  textWrap: {
    control: 'radio',
    options: ['wrap', 'no-wrap'],
    defaultValue: 'no-wrap',
  },
  translate: {
    control: 'boolean',
    defaultValue: true,
  },
  iconHasCircle: {
    control: 'boolean',
    defaultValue: false,
  },
  icon: {
    control: 'select',
    options: IconNames,
  },
  iconPosition: {
    control: 'radio',
    options: ['left', 'right'],
  },
  isLoading: {
    control: 'boolean',
    defaultValue: false,
  },
  disabled: {
    control: 'boolean',
    defaultValue: false,
  },
  visible: {
    control: 'boolean',
    defaultValue: true,
  },
  uppercase: {
    control: 'boolean',
    defaultValue: false,
  },
  size: {
    control: 'radio',
    options: BaseButtonSizeOptions,
    defaultValue: ButtonSizes.medium,
  },
  type: {
    control: 'radio',
    options: BaseButtonTypeOptions,
    defaultValue: ButtonTypes.primary,
  },
  color: {
    description: '⚠️ deprecated',
    control: 'color',
  },
  hoverColor: {
    description: '⚠️ deprecated',
    control: 'color',
  },
  fontWeight: {
    description: '⚠️ deprecated',
    control: 'radio',
    options: FontWeights,
  },
  textType: {
    description: '⚠️ deprecated',
    control: 'select',
    options: TextTypes,
  },
  shape: {
    description: '⚠️ deprecated - use `rounded` prop instead',
    control: 'radio',
    options: ['default', 'round'],
  },
  iconLeft: {
    description: '⚠️ deprecated use `icon` and `iconPosition` props instead',
    control: 'select',
    options: IconNames,
  },
  iconRight: {
    description: '⚠️ deprecated use `icon` and `iconPosition` props instead',
    control: 'select',
    options: IconNames,
  },
  iconSize: {
    description: '⚠️ deprecated',
    control: 'radio',
    options: IconSize,
  },
  iconColor: {
    description: '⚠️ deprecated',
    control: 'color',
  },
  iconHoverColor: {
    description: '⚠️ deprecated',
    control: 'color',
  },
  iconFillColor: {
    description: '⚠️ deprecated',
    control: 'color',
  },
  iconLargeOnHover: {
    description: '⚠️ deprecated',
    control: 'boolean',
    defaultValue: false,
  },
};

// Storybook argTypes configuration for muted buttons (includes blurred and inverted)
export const mutedButtonArgTypes = {
  ...buttonArgTypes,
  type: {
    control: 'radio',
    options: { muted: ButtonTypes.muted },
    defaultValue: ButtonTypes.muted,
  },
  size: {
    control: 'radio',
    options: ButtonSizes, // Muted buttons can use all sizes including extraLarge
    defaultValue: ButtonSizes.medium,
  },
  blurred: {
    control: 'boolean',
    defaultValue: false,
    description: 'Applies blur effect to the button background (muted buttons only)',
  },
  inverted: {
    control: 'boolean',
    defaultValue: false,
    description: 'Inverts the button colors (muted buttons only)',
  },
};

export const BUTTONS_EXCLUDED_CONTROLS_IN_DEMO = [
  ...BUTTONS_EXCLUDED_CONTROLS_DEFAULT,
  'type',
  'children',
  'size',
  'color',
  'hoverColor',
  'textWrap',
  'fontWeight',
  'textType',
  'shape',
  'iconLeft',
  'iconRight',
  'iconSize',
  'iconColor',
  'iconHoverColor',
  'iconFillColor',
  'iconHasCircle',
  'iconLargeOnHover',
  'isLoading',
  'disabled',
  'visible',
  'uppercase',
  'onClick',
  'onMouseDown',
];

// Demo rendering utils:
export const ButtonsDemoRendering = (args: ButtonProps): React.JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const int = setInterval(() => {
      setIsLoading((prev) => !prev);
    }, 1000);

    return () => {
      clearInterval(int);
    };
  }, []);

  const _normalButtonDemo = { title: 'Normal', args: { ...args, children: 'Test' } as ButtonProps };
  const _loadingArgsDemo = {
    title: 'Loading',
    args: { ...args, isLoading: true, iconPosition: 'right', children: 'Test' } as ButtonProps,
  };

  const _iconLeftArgsDemo = {
    title: 'Icon on the left',
    args: { ...args, iconPosition: 'left', icon: IconNames.add, children: 'Test' } as ButtonProps,
  };
  const _iconRightArgsDemo = {
    title: 'Icon on the right',
    args: { ...args, iconPosition: 'right', icon: IconNames.add, children: 'Test' } as ButtonProps,
  };
  const _iconOnlyArgsDemo = {
    title: 'Button without label',
    args: { ...args, icon: IconNames.add, children: undefined } as ButtonProps,
  };
  const _iconDisabledDemo = { title: 'Disabled', args: { ...args, children: 'Test', disabled: true } as ButtonProps };

  const demoList = [
    _normalButtonDemo,
    _loadingArgsDemo,
    _iconLeftArgsDemo,
    _iconRightArgsDemo,
    _iconOnlyArgsDemo,
    _iconDisabledDemo,
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <Text
        color={args.inverted ? 'white' : undefined}
        type={TextTypes.heading3}
      >{`Buttons Demo for ${args.type ?? ButtonTypes.primary} type`}</Text>
      {demoList.map(({ title, args }, index) => (
        <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Text color={args.inverted ? 'white' : undefined}>{title}</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button {...args} size={ButtonSizes.small} />
            <Button {...args} size={ButtonSizes.medium} />
            <Button {...args} size={ButtonSizes.large} />
            {args.type === ButtonTypes.muted ? <Button {...args} size={ButtonSizes.extraLarge} /> : null}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Text color={args.inverted ? 'white' : undefined}>Button loading state transition</Text>
        <div style={{ display: 'grid', gap: '16px' }}>
          <Button {..._normalButtonDemo.args} size={ButtonSizes.small} isLoading={isLoading} />
          <Button {..._normalButtonDemo.args} size={ButtonSizes.medium} isLoading={isLoading} />
          <Button {..._normalButtonDemo.args} size={ButtonSizes.large} isLoading={isLoading} />
          {_normalButtonDemo.args.type === ButtonTypes.muted ? (
            <Button {..._normalButtonDemo.args} size={ButtonSizes.extraLarge} isLoading={isLoading} />
          ) : null}
        </div>
      </div>
      <Text color={args.inverted ? 'white' : undefined} type={TextTypes.heading3}>
        {'One under the other'}
      </Text>
      {demoList.map(({ title, args }, index) => (
        <div key={index} style={{ display: 'grid', gap: '16px' }}>
          <Text color={args.inverted ? 'white' : undefined}>{title}</Text>
          <div style={{ display: 'grid', alignItems: 'center', gap: '16px' }}>
            <Button {...args} size={ButtonSizes.small} />
            <Button {...args} size={ButtonSizes.medium} />
            <Button {...args} size={ButtonSizes.large} />
            {args.type === ButtonTypes.muted ? <Button {...args} size={ButtonSizes.extraLarge} /> : null}
          </div>
        </div>
      ))}
    </div>
  );
};
