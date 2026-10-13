import { alignItemsCenter, dFlex, gap1, ml1 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { Avatar } from '@vanguard/Avatar/Avatar';
import { ValueOfAvatarIconMap } from '@vanguard/Avatar/Avatar.enum';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, Text } from '@vanguard/Text/Text';
import React from 'react';

import type { TabConfig } from '../Tabs';
import styles from './Tab.module.scss';

/**
 * Props accepted for backwards compatibility with the former MUI-based `Tab`.
 * None of them has any effect; they are swallowed and never reach the DOM.
 */
export interface TabMuiCompatProps {
  /** @deprecated MUI `Tab` prop. Ignored; use `tabIcons` or a ReactNode `label`. */
  icon?: any;
  /** @deprecated MUI `Tab` prop. Ignored. */
  iconPosition?: 'top' | 'bottom' | 'start' | 'end';
  /** @deprecated MUI `Tab` prop. Ignored. */
  wrapped?: boolean;
  /** @deprecated MUI ripple prop. Ignored (no ripple is rendered). */
  disableRipple?: boolean;
  /** @deprecated MUI ripple prop. Ignored (no ripple is rendered). */
  disableFocusRipple?: boolean;
  /** @deprecated MUI ripple prop. Ignored (no ripple is rendered). */
  disableTouchRipple?: boolean;
  /** @deprecated MUI ripple prop. Ignored (no ripple is rendered). */
  centerRipple?: boolean;
  /** @deprecated MUI ripple prop. Ignored (no ripple is rendered). */
  focusRipple?: boolean;
  /** @deprecated MUI ripple prop. Ignored (no ripple is rendered). */
  TouchRippleProps?: any;
  /** @deprecated MUI ripple prop. Ignored (no ripple is rendered). */
  touchRippleRef?: any;
  /** @deprecated MUI `ButtonBase` prop. Ignored; style `:focus-visible` instead. */
  focusVisibleClassName?: string;
  /** @deprecated MUI `ButtonBase` prop. Ignored; use `onFocus`. */
  onFocusVisible?: (event: React.FocusEvent<any>) => void;
  /** @deprecated MUI `ButtonBase` prop. Ignored (tabs always render as buttons). */
  LinkComponent?: React.ElementType;
  /** @deprecated MUI `ButtonBase` prop. Ignored (tabs always render as buttons). */
  href?: string;
  /** @deprecated MUI system prop. Ignored; use `className` / `style`. */
  sx?: any;
  /** @deprecated MUI classes override. Ignored; use `className`. */
  classes?: any;
  /** @deprecated MUI `ButtonBase` action ref. Ignored. */
  action?: any;
  /** @deprecated Inherited from the former MUI `Tab` props. Ignored; use `Tabs.onChange`. */
  onChange?: React.FormEventHandler<HTMLDivElement>;
  /** @deprecated The former MUI `Tab` only accepted `null`. Ignored; use `label`. */
  children?: React.ReactNode;
  /** @deprecated Kept for type compatibility with the former MUI props (React `key`); ignored inside `tabs`. */
  key?: React.Key | null;
}

/** Keys of {@link TabMuiCompatProps}, stripped before spreading props onto the DOM. */
const TAB_MUI_COMPAT_KEYS: (keyof TabMuiCompatProps)[] = [
  'icon',
  'iconPosition',
  'wrapped',
  'disableRipple',
  'disableFocusRipple',
  'disableTouchRipple',
  'centerRipple',
  'focusRipple',
  'TouchRippleProps',
  'touchRippleRef',
  'focusVisibleClassName',
  'onFocusVisible',
  'LinkComponent',
  'href',
  'sx',
  'classes',
  'action',
  'onChange',
  'children',
];

/**
 * A single tab definition, as passed to `<Tabs tabs={[...]} />`.
 * Any extra HTML attributes (`className`, `style`, `id`, `aria-*`, `onClick`, ...) are forwarded to the
 * rendered `<button role="tab">`. Event handlers keep the `HTMLDivElement` typing of the former MUI `Tab`
 * (whose default component type was `div`) so existing annotations keep compiling.
 */
export interface TabProps<T = any>
  extends TabMuiCompatProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  /** Ref to the rendered `<button role="tab">` element. */
  ref?: React.Ref<any>;
  /**
   * Panel content rendered by `Tabs` when this tab is selected.
   * Omit it for a bar-only tab (no panel is rendered); `null` renders an empty panel (useful for lazy content).
   */
  component?: React.ReactNode | null;
  /** Tab label. Strings are rendered (and translated) through vanguard `Text`; ReactNodes are rendered as-is. */
  label?: string | React.ReactNode;
  /** Value identifying the tab; compared with `Tabs.value`. Defaults to the tab's index in the `tabs` array. */
  value?: T;
  /** When true the tab is hidden from the bar (its panel is still rendered through the panel loop). */
  disabled?: boolean;
  /** Avatar icons rendered before the label (one or several, overlapped). */
  tabIcons?: (ValueOfAvatarIconMap | string)[];
  /** Marks the tab as erroneous: shows an exclamation icon (with `tabIcons`) and an error border when selected. */
  hasError?: boolean;
  /** `data-testid` of the label element. Overridden by `Tabs` (`${testId}-${index}`) when `Tabs.testId` is set. */
  testId?: string;
  /** Selected state. Computed by `Tabs` from its `value`; only set it when rendering `Tab` standalone. */
  selected?: boolean;
  /** @deprecated Has no effect. */
  hasBorderBottom?: boolean;
  /** @deprecated Has no effect. */
  showBackgroundColor?: boolean;
  /** @deprecated Has no effect. */
  simple?: boolean;
}

/** Props set by `Tabs` on every rendered tab. */
interface InternalTabProps {
  /** Visual configuration shared by all tabs of the bar. */
  tabConfig?: TabConfig;
}

/** Returns a shallow copy of `source` without the given keys. */
export const omitProps = <P extends object, K extends PropertyKey>(source: P, keys: readonly K[]): Omit<P, K> => {
  const result = { ...source } as Record<PropertyKey, unknown>;
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<P, K>;
};

/** Props owned by `Tab` (not forwarded to the button as-is). */
const TAB_OWN_KEYS = [
  'component',
  'label',
  'value',
  'disabled',
  'tabIcons',
  'hasError',
  'testId',
  'selected',
  'hasBorderBottom',
  'showBackgroundColor',
  'simple',
  'tabConfig',
  'className',
] as const;

const TEXT_TRANSFORM_CLASSES: Record<string, string | undefined> = {
  uppercase: styles.textUppercase,
  capitalize: styles.textCapitalize,
  lowercase: styles.textLowercase,
};

export const Tab = (props: TabProps & InternalTabProps) => {
  const { hasError = false, tabIcons, testId, tabConfig, selected = false, label, className } = props;
  // Handlers are typed for `HTMLDivElement` (former MUI typing) but are attached to the button.
  const buttonProps = omitProps(
    omitProps(props, TAB_MUI_COMPAT_KEYS),
    TAB_OWN_KEYS,
  ) as unknown as React.ButtonHTMLAttributes<HTMLButtonElement> & {
    ref?: React.Ref<HTMLButtonElement>;
  };

  const {
    theme = 'highlight',
    iconSize = 'default',
    tabTextTransform = 'none',
    tabHeight,
    tabNoMinWidth,
    padding,
    tabGrow,
  } = tabConfig || {};
  const isFloating = theme === 'floating';
  const labelColor = selected && !isFloating ? 'var(--fn-fg-cta)' : 'var(--fn-fg)';

  const renderLabel = () => {
    if (!tabIcons) {
      return typeof label === 'string' ? (
        <Text
          testId={testId}
          className={classNames(styles.tabLabel)}
          color={labelColor}
          fontWeight={selected && !isFloating ? FontWeights.bold : FontWeights.regular}
        >
          {label}
        </Text>
      ) : (
        label
      );
    }

    if (tabIcons.length > 1) {
      return (
        <div data-testid={testId} className={classNames(dFlex, alignItemsCenter, styles.tabsDirectoryIcons)}>
          {tabIcons.map((icon, iconIndex) => (
            <div key={iconIndex} className={classNames(styles.tabsDirectoryIcon)}>
              <Avatar noHover={true} size={iconSize === 'small' ? 'xs' : 'small'} icon={icon} name={icon} />
            </div>
          ))}
          {typeof label === 'string' ? (
            <div>
              <Text className={classNames(ml1)} color={labelColor}>
                {label}
              </Text>
              <Render if={hasError}>
                <Icon
                  fillColor={'var(--e100)'}
                  hasCircle={true}
                  color={'var(--e500)'}
                  type={iconSize === 'small' ? IconSize.small : IconSize.large}
                >
                  {IconNames.exclamation}
                </Icon>
              </Render>
            </div>
          ) : (
            label
          )}
        </div>
      );
    }

    if (tabIcons.length === 1) {
      return (
        <div data-testid={testId} className={classNames(dFlex, alignItemsCenter, gap1)}>
          <Avatar noHover={true} size={iconSize === 'small' ? 'xs' : 'small'} icon={tabIcons[0]} />
          {typeof label === 'string' ? <Text color={labelColor}>{label}</Text> : label}
          <Render if={hasError}>
            <Icon fillColor={'var(--e100)'} hasCircle={true} color={'var(--e500)'}>
              {IconNames.exclamation}
            </Icon>
          </Render>
        </div>
      );
    }

    return null;
  };

  return (
    <button
      tabIndex={selected ? 0 : -1}
      {...buttonProps}
      type="button"
      role="tab"
      aria-selected={selected}
      className={classNames(
        styles.tab,
        styles[theme],
        selected ? styles.selected : '',
        selected && hasError ? styles.hasError : '',
        tabHeight === 'small' ? styles.heightSmall : '',
        tabNoMinWidth === true ? styles.noMinWidth : '',
        padding === 'small' ? styles.paddingSmall : '',
        tabGrow === false ? styles.noGrow : '',
        TEXT_TRANSFORM_CLASSES[tabTextTransform] ?? '',
        className ?? '',
      )}
    >
      {renderLabel()}
    </button>
  );
};
