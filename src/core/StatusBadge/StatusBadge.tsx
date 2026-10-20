import { classNames } from '@helpers/classNames';
import { AnimatedConditional } from '@vanguard/AnimatedConditional/AnimatedConditional';
import { IconNames } from '@vanguard/Icon/IconNames';
import { StatusBadgeIcon } from '@vanguard/StatusBadge/StatusBadgeIcon/StatusBadgeIcon';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import { getColorsBasedOnStatus } from './status-badge-get-colors-based-on-status';
import styles from './StatusBadge.module.scss';
// import { ReviewSourcesFilterStatus } from "@components/reputation/ReputationReviewSources/utils/review-source-status-config";

export type StatusBadgeBoostStatus = 'active' | 'paused' | 'deleted' | 'archived' | 'draft';
//TODO FIX ME
export type StatusBadgeReviewStatus = any; //ReviewSourcesFilterStatus;

export type StatusBadgePostStatus =
  | 'live'
  | 'pending_verification'
  | 'not_approved'
  | 'scheduled'
  | 'past'
  | 'publishing'
  | 'published'
  | 'draft'
  | 'published_variant';
export type StatusBadgeStatus =
  | 'danger'
  | 'info'
  | 'warning'
  | 'success'
  | 'publishing'
  | 'publishingStatic'
  | 'neutral'
  | 'limitExcedeed'
  | 'ai'
  | 'ado'
  | StatusBadgePostStatus
  | StatusBadgeBoostStatus
  | 'sent'
  | 'queued'
  | 'not_sent'
  | 'deleted'
  | 'connected'
  | StatusBadgeReviewStatus;

// | StatusBadgeReviewStatus;
export type StatusBadgeIconVariant = 'normal' | 'reverse' | 'none';
export type StatusBadgeSize = 'default' | 'compact';

export interface StatusBadgeProps {
  status: StatusBadgeStatus;
  text: string;
  translate?: boolean;
  className?: string;
  fontWeight?: FontWeights;
  numberValue?: number;
  icon?: IconNames;
  hideIcon?: boolean;
  variant?: 'small' | 'big';
  /** Only applies to the `small` variant. `compact`: 18px tall, 11px bold text. */
  size?: StatusBadgeSize;
  iconVariant?: StatusBadgeIconVariant;
  isBlurred?: boolean;
  borderRadius?: number;
  capitalizeStatus?: boolean;
}

const COMPACT_FONT_SIZE = 11;

export const StatusBadge = (props: StatusBadgeProps) => {
  const {
    status,
    text,
    translate = true,
    numberValue,
    icon,
    className,
    variant = 'small',
    size = 'default',
    iconVariant = 'normal',
    hideIcon = false,
    capitalizeStatus = false,
    isBlurred,
    fontWeight,
    borderRadius,
  } = props;

  let { iconColor, iconName } = getColorsBasedOnStatus(status);
  const { reverseColor, textColor, bgColor, borderColor } = getColorsBasedOnStatus(status);
  if (icon) {
    iconName = icon;
  }

  const hasNumberValue = numberValue !== undefined;
  const hasIconReverse = iconVariant === 'reverse';
  if (hasIconReverse) {
    iconColor = bgColor;
  }

  const isCompact = size === 'compact';
  const color = `var(${iconColor}-rgb)`;
  if (variant === 'big') {
    return (
      <div className={classNames(className, styles.statusIcon)}>
        <div
          className={styles.gradient}
          style={{
            boxShadow: `0px -48px 56px rgba(${color}, 0.15), 
                        0px -24px 48px rgba(${color}, 0.18),
                        0px -16px 24px rgba(${color}, 0.2)`,
          }}
        />
        <div className={styles.mask} />
        <AnimatedConditional condition={!hideIcon} animation={'none'}>
          <StatusBadgeIcon
            variant={'big'}
            status={status}
            hasIconReverse={hasIconReverse}
            iconVariant={iconVariant}
            iconName={iconName}
          />
        </AnimatedConditional>
        <div className={classNames(styles.mask2)}>
          <Text
            isBlurred={isBlurred}
            type={TextTypes.textIntro}
            fontWeight={FontWeights.bold}
            color={!hasIconReverse ? iconColor : reverseColor}
            translate={translate}
          >
            {text}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        className,
        isBlurred ? styles.isBlurred : '',
        hideIcon ? styles.statusBadgeNoIcon : styles.statusBadge,
        iconVariant === 'none' ? styles.statusBadgeNoneIcon : undefined,
        isCompact ? styles.compact : undefined,
      )}
      style={{
        backgroundColor: `var(${bgColor})`,
        border: borderColor ? `1px solid var(${borderColor})` : '',
        borderRadius: borderRadius,
      }}
    >
      <AnimatedConditional condition={!hideIcon} animation={'none'}>
        <StatusBadgeIcon
          variant={'small'}
          status={status}
          hasIconReverse={hasIconReverse}
          iconVariant={iconVariant}
          iconName={iconName}
          compact={isCompact}
        />
      </AnimatedConditional>
      <Text
        type={TextTypes.textCaption}
        isBlurred={isBlurred}
        fontWeight={fontWeight ?? (isCompact ? FontWeights.bold : undefined)}
        fontSize={isCompact ? COMPACT_FONT_SIZE : undefined}
        capitalize={capitalizeStatus}
        color={textColor}
        textWrap={isCompact ? 'no-wrap' : 'wrap'}
        ellipsis={isCompact}
        className={isCompact ? styles.compactLabel : undefined}
        translate={translate}
      >
        {text}
      </Text>
      <AnimatedConditional condition={hasNumberValue}>
        <div className={classNames(hasNumberValue ? styles.ml1 : '')}>
          <Text
            isBlurred={isBlurred}
            fontWeight={FontWeights.bold}
            translate={false}
            color={textColor}
            type={TextTypes.textCaption}
            fontSize={isCompact ? COMPACT_FONT_SIZE : undefined}
          >
            {numberValue}
          </Text>
        </div>
      </AnimatedConditional>
    </div>
  );
};
