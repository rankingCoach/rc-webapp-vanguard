import { breakpoints } from '@config/breakpoints';
import { useWindowResize } from '@custom-hooks/use-window.resize';
import {
  alignItemsCenter,
  alignItemsTabletCenter,
  dFlex,
  dFlexColumn,
  dFlexRowReverse,
  dFlexTabletColumn,
  flexWrap,
  gap2,
  gap6,
  gapTablet9,
  justifyContentCenter,
  p3,
  pl3,
  positionRelative,
  pr3,
  pt1,
  px4,
  py4,
  w100,
} from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { AnimatedConditional } from '@vanguard/AnimatedConditional/AnimatedConditional';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconNames } from '@vanguard/Icon/IconNames';
import { List, ListElementSchema, ListType } from '@vanguard/List/List';
import { LottieAnimationLoader } from '@vanguard/LottieAnimationLoader/LottieAnimationLoader';
import { FontWeights, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './FeatureBox.module.scss';

type JSON = (string | Record<string, any>) & (string | undefined);

export interface FeatureBoxProps {
  title: string;
  replacements?: TextReplacements;
  animationTranslations?: Record<string, string>;
  subtitle?: string;
  boldTitle?: boolean;
  featuresList?: ListElementSchema[];
  animation: JSON | string;
  alternateRows?: boolean;
  onClick: () => void;
  btnText?: string;
  style?: React.CSSProperties;
  animationStyle?: React.CSSProperties;
  leftColumnClass?: string;
  rightColumnClass?: string;
  className?: string;
  type?: ListType;
  buttonPosition?: 'right' | 'left';
  bgAnimationIlustration?: React.ReactNode;
  buttonReplacements?: TextReplacements;
}

export const FeatureBox = (props: FeatureBoxProps) => {
  const {
    title,
    replacements,
    animationTranslations,
    boldTitle = true,
    subtitle,
    featuresList = [],
    animation,
    alternateRows,
    onClick,
    btnText,
    style,
    animationStyle,
    className,
    type = 'icon',
    leftColumnClass,
    rightColumnClass,
    buttonPosition,
    bgAnimationIlustration,
    buttonReplacements,
  } = props;

  const width = useWindowResize();

  return (
    <ComponentContainer
      style={style ? style : undefined}
      className={classNames(
        className,
        dFlex,
        justifyContentCenter,
        gap6,
        alternateRows ? classNames(dFlexTabletColumn, dFlexRowReverse) : undefined,
        width > breakpoints.tablet ? undefined : classNames(dFlexColumn, p3, gapTablet9, alignItemsTabletCenter),
      )}
    >
      <div className={classNames(leftColumnClass ? leftColumnClass : '', styles.feature, pl3, pr3)}>
        <div className={classNames(dFlex, flexWrap)}>
          <Text
            replacements={replacements}
            type={TextTypes.heading3}
            fontWeight={boldTitle ? FontWeights.bold : FontWeights.regular}
          >
            {title}
          </Text>
        </div>
        <Text type={TextTypes.textIntro} className={pt1}>
          {subtitle}
        </Text>
        <div className={classNames(py4)}>
          <List listElements={featuresList} type={type} />
        </div>
        <AnimatedConditional condition={buttonPosition == 'left'}>
          <div className={width < breakpoints.tablet ? classNames(dFlex, justifyContentCenter, alignItemsCenter) : ''}>
            <Button
              size={ButtonSizes.extraLarge}
              type={ButtonTypes.primary}
              iconRight={IconNames.arrowRight}
              onClick={onClick}
              replacements={buttonReplacements}
            >
              {btnText}
            </Button>
          </div>
        </AnimatedConditional>
      </div>
      <div
        className={classNames(
          gap2,
          dFlexColumn,
          justifyContentCenter,
          alignItemsCenter,
          pl3,
          pr3,
          rightColumnClass,
          styles.featureBoxAnimationContainer,
        )}
      >
        <div className={classNames(positionRelative)} style={{ width: '100%' }}>
          {bgAnimationIlustration && bgAnimationIlustration}
          {animation && (
            <div style={animationStyle} className={classNames(styles.animation)}>
              <LottieAnimationLoader src={animation} translations={animationTranslations} />
            </div>
          )}
        </div>
        <AnimatedConditional className={w100} condition={buttonPosition == 'right'}>
          <Button
            className={classNames(px4, dFlex, justifyContentCenter, alignItemsCenter, w100, styles.upsellButton)}
            size={ButtonSizes.extraLarge}
            onClick={onClick}
          >
            {btnText}
          </Button>
        </AnimatedConditional>
      </div>
    </ComponentContainer>
  );
};
