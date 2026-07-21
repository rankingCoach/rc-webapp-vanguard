import { ComingSoonCard } from '@common/ComingSoonCard/ComingSoonCard';
import { alignItemsCenter, dFlex, gap1, mb1, pb0_5, pb1_5 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { navigationService, ROUTES_ENGAGEMENT } from '@services/navigation.service';
import { Button, ButtonTypes } from '@vanguard/Button/Button';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Link } from '@vanguard/Link/Link';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './StatisticsBoardItem.module.scss';

export enum CardType {
  chat = 'chat',
  posts = 'posts',
  events = 'events',
  offers = 'offers',
  products = 'products',
}

/**
 * Props
 * ---------------------------------------------------------------------------------------------------------------------
 */
type CtaProps = {
  ctaIcon?: IconNames;
  ctaText?: string;
  ctaOnClick?: string | (() => void);
  ctaDisabled?: boolean;
  ctaIsLoading?: boolean;
};

type CardProps = {
  total?: number | string;
  linkText?: string;
  linkCta?: ROUTES_ENGAGEMENT;
  title: string;
  description: string;
  iconName?: IconNames;
  iconColor?: string;
  iconFillColor?: string;
  cardOnClick?: string | (() => void);
  bgIcon?: IconNames;
  comingSoon?: boolean;
  type?: CardType;
  comingSoonIllustration?: React.ReactNode;
};

export type StatisticsBoardItemProps = {
  testId?: string;
  disabled?: boolean;
  empty?: boolean;
} & CtaProps &
  CardProps;

/**
 * Component
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const StatisticsBoardItem = (props: StatisticsBoardItemProps) => {
  const {
    type,
    empty = false,
    testId = 'StatisticsBoardItem',
    total,
    disabled,
    title,
    description,
    iconName,
    linkText,
    linkCta,
    ctaText,
    ctaIsLoading,
    ctaDisabled,
    ctaOnClick,
    cardOnClick,
    ctaIcon,
    iconFillColor,
    iconColor,
    bgIcon,
    comingSoon,
  } = props;

  /**
   * Functions
   */
  const onCardClick = () => {
    if (typeof cardOnClick === 'string') {
      window.location.href = cardOnClick ?? '#';
      return;
    } else if (linkCta) {
      navigationService.goTo(linkCta);
    }

    cardOnClick && cardOnClick();
  };

  const onCtaClick = () => {
    if (typeof ctaOnClick === 'string') {
      window.location.href = ctaOnClick ?? '#';
      return;
    }

    ctaOnClick && ctaOnClick();
  };

  /**
   * Getters
   */
  const getCardIconColor = () => {
    if (empty) {
      return '--p400';
    }
    if (iconColor) {
      return iconColor;
    }
    return '--n000';
  };

  const getCardIconFillColor = () => {
    if (disabled && !empty) {
      return '--n400';
    }
    if (empty) {
      return '--p100';
    }
    if (iconFillColor) {
      return iconFillColor;
    }
    return '--p400';
  };

  const disabledStyle = disabled ? styles.disabled : null;
  const emptyStyle = empty ? styles.empty : null;

  if (comingSoon) {
    return <ComingSoonCard type={type} />;
  }

  /**
   * Return view
   * ---
   */
  return (
    <ComponentContainer testId={testId} className={classNames(styles.container, disabledStyle, emptyStyle)}>
      {empty && bgIcon && (
        <div className={styles.cardBg}>
          <Icon type={IconSize.small} forceSize={'100%'} color={'color-mix(in srgb, var(--n900) 10%, transparent)'}>
            {bgIcon}
          </Icon>
        </div>
      )}

      <div className={styles.card} onClick={onCardClick}>
        <div className={classNames(dFlex, gap1, alignItemsCenter, mb1)}>
          <Icon
            type={IconSize.small}
            color={getCardIconColor()}
            fillColor={getCardIconFillColor()}
            hasCircle={true}
            circleSize={32}
            className={styles.icon}
          >
            {iconName ?? IconNames.add}
          </Icon>

          {total !== undefined && (
            <Text fontWeight={FontWeights.bold} type={TextTypes.heading3} className={styles.text} translate={false}>
              {total}
            </Text>
          )}
        </div>

        {title && (
          <Text
            fontWeight={FontWeights.medium}
            type={TextTypes.textHelp}
            color={'--n700'}
            className={classNames(styles.text, pb0_5)}
          >
            {title}
          </Text>
        )}

        <Text
          fontWeight={FontWeights.regular}
          type={empty ? TextTypes.textHelp : TextTypes.textCaption}
          color={empty ? '--n700' : '--n500'}
          className={classNames(styles.text, pb1_5)}
        >
          {description}
        </Text>

        {linkText && !empty && (
          <div className={styles.link}>
            <Link
              testId={`${testId}_Link`}
              newTabIcon={true}
              iconName={IconNames.arrowRight}
              type={TextTypes.textHelp}
              className={styles.text}
              onClick={() => {
                if (linkCta) {
                  navigationService.goTo(linkCta);
                }
              }}
            >
              {linkText}
            </Link>
          </div>
        )}
      </div>

      {!empty && ctaText && (
        <div className={styles.ctaContainer}>
          <Button
            testId={`${testId}_Button`}
            className={styles.cta}
            iconLeft={ctaIcon || iconName || IconNames.add}
            iconColor={disabled ? '--n300' : '--p400'}
            iconFillColor={'--p100'}
            iconHasCircle={true}
            type={ButtonTypes.default}
            textType={TextTypes.text}
            fontWeight={FontWeights.regular}
            textWrap={'no-wrap'}
            hoverColor={'--p400'}
            color={'--n700'}
            iconLargeOnHover={true}
            onClick={onCtaClick}
            isLoading={ctaIsLoading}
            disabled={ctaDisabled}
          >
            {!disabled ? ctaText : 'Coming soon'}
          </Button>
        </div>
      )}
    </ComponentContainer>
  );
};
