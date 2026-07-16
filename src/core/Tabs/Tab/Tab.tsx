import { alignItemsCenter, dFlex, gap1, ml1 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { Tab as MuiTab, TabProps as MuiTabProps } from '@mui/material';
import { Avatar } from '@vanguard/Avatar/Avatar';
import { ValueOfAvatarIconMap } from '@vanguard/Avatar/Avatar.enum';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, Text } from '@vanguard/Text/Text';
import React from 'react';

import { TabConfig } from '../Tabs';
import styles from './Tab.module.scss';

export interface TabProps<T = any> extends Omit<MuiTabProps, 'component'> {
  component?: React.ReactNode;
  selected?: boolean;
  label?: string | React.ReactNode;
  tabIcons?: ValueOfAvatarIconMap[];
  hasError?: boolean;
  hasBorderBottom?: boolean;
  showBackgroundColor?: boolean;
  simple?: boolean;
  testId?: string;
  value?: T;
  disabled?: boolean;
}

interface InternalTabProps {
  tabConfig?: TabConfig;
}

export const Tab = (props: TabProps & InternalTabProps) => {
  const {
    hasError = false,
    tabIcons,
    hasBorderBottom,
    showBackgroundColor = true,
    simple = false,
    testId,
    disabled = false,
    tabConfig,
    ...tabProps
  } = props;
  const { selected, label, value } = tabProps;

  const { theme = 'highlight', iconSize = 'default', tabTextTransform = 'none' } = tabConfig || {};

  const renderLabel = () => {
    if (!tabIcons) {
      return typeof label === 'string' ? (
        <Text
          testId={testId}
          className={classNames(styles.tabLabel)}
          color={selected ? 'var(--fn-fg-cta)' : 'var(--fn-fg)'}
          fontWeight={selected ? FontWeights.bold : FontWeights.regular}
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
          {tabIcons.map((icon, index) => (
            <div key={index} className={classNames(styles.tabsDirectoryIcon)}>
              <Avatar noHover={true} size={iconSize === 'small' ? 'xs' : 'small'} icon={icon} name={icon} />
            </div>
          ))}
          {typeof label === 'string' ? (
            <div>
              <Text className={classNames(ml1)} color={selected ? 'var(--fn-fg-cta)' : 'var(--fn-fg)'}>
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
        <div className={classNames(classNames(dFlex, alignItemsCenter, gap1))}>
          <Avatar noHover={true} size={iconSize === 'small' ? 'xs' : 'small'} icon={tabIcons[0]} />
          {typeof label === 'string' ? (
            <Text color={selected ? 'var(--fn-fg-cta)' : 'var(--fn-fg)'}>{label}</Text>
          ) : (
            label
          )}
          <Render if={hasError}>
            <Icon fillColor={'var(--e100)'} hasCircle={true} color={'var(--e500)'}>
              {IconNames.exclamation}
            </Icon>
          </Render>
        </div>
      );
    }
  };

  return (
    <MuiTab
      {...tabProps}
      sx={{
        ...(selected && {
          ...(hasError && {
            border: '1px solid var(--e500)',
            borderRadius: '8px',
            color: 'var(--e500)',
          }),
        }),
        textTransform: tabTextTransform,
      }}
      className={classNames(styles.tab, styles[theme], selected ? styles.selected : '')}
      label={renderLabel()}
    />
  );
};
