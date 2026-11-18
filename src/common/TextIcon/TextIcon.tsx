import { alignItemsCenter, alignItemsStart, mt0_5 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { FontWeights, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './TextIcon.module.scss';

export interface TextIconProps {
  children?: string;
  iconColor?: string;
  iconSize?: IconSize;
  verticalAlign?: 'start' | 'center';
  icon: IconNames;
  iconCircleSize?: number;
  iconHasCircle?: boolean;
  iconFillColor?: string;
  iconForceSize?: number | string;
  iconRotating?: boolean;
  translate?: boolean;
  textType?: TextTypes;
  fontWeight?: FontWeights;
  textTight?: boolean;
  textColor?: null | string;
  testId?: string;
  replacements?: TextReplacements;
  className?: string;
  maxWidth?: string;
  ellipsis?: boolean;
}

export const TextIcon = (props: TextIconProps) => {
  const {
    testId,
    children,
    icon,
    iconColor,
    verticalAlign = 'center',
    iconSize = IconSize.large,
    iconHasCircle,
    iconFillColor,
    iconRotating,
    iconCircleSize,
    iconForceSize,
    translate,
    fontWeight,
    textType,
    textTight,
    textColor,
    replacements,
    className,
    ellipsis,
    maxWidth,
  } = props;

  /**
   * Classes
   */
  function getContainerClasses() {
    if (verticalAlign === 'start') {
      return alignItemsStart;
    } else {
      return alignItemsCenter;
    }
  }

  function getIconClasses() {
    if (verticalAlign === 'start' && iconSize === IconSize.small) {
      return mt0_5;
    } else {
      return undefined;
    }
  }

  /**
   * Return view
   */
  return (
    <ComponentContainer
      data-slot={'text-icon'}
      testId={testId}
      key={children}
      className={classNames(styles.container, getContainerClasses())}
      style={!!maxWidth ? { maxWidth: maxWidth } : {}}
    >
      <Icon
        hasCircle={iconHasCircle}
        circleSize={iconCircleSize}
        forceSize={iconForceSize}
        testId={'icon'}
        type={iconSize}
        spin={iconRotating}
        fillColor={iconFillColor}
        color={iconColor ? iconColor : '--n400'}
        className={classNames(styles.icon, getIconClasses())}
      >
        {icon}
      </Icon>

      <Text
        textTight={textTight}
        fontWeight={fontWeight}
        replacements={replacements}
        type={textType}
        color={textColor ? textColor : undefined}
        translate={translate}
        className={className}
        ellipsis={ellipsis}
      >
        {children == '' || !children ? '&#8212;' : children}
      </Text>
    </ComponentContainer>
  );
};
