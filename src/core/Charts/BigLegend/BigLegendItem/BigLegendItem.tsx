import { useFormatNumberWithCurrency } from '@custom-hooks/use-format-number-with-currency';
import { dFlex, dFlexRow } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { Avatar } from '@vanguard/Avatar/Avatar';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { StatusBadge, StatusBadgeStatus } from '@vanguard/StatusBadge/StatusBadge';
import { FontWeights, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React, { CSSProperties, useEffect, useState } from 'react';

import { AnimatedConditional } from '../../../AnimatedConditional/AnimatedConditional';
import styles from './BigLegendItem.module.scss';

export interface BigLegendItemProps {
  currentNumber: number;
  previousNumber?: number;
  totalNumber?: number;
  showPercentage?: boolean;
  showBadge?: boolean;
  showPreviousNumber?: boolean;
  showPreviousNumberText?: boolean;
  previousNumberText?: string;
  showPercentageFromTotal?: boolean;
  roundNumbers?: boolean;
  formatWithCurrency?: boolean;
  iconName?: IconNames;
  iconSize?: IconSize;
  iconFillColor?: string;
  topTitle?: string | React.ReactNode;
  title?: string;
  description?: string;
  descriptionColor?: string;
  descriptionFont?: FontWeights;
  descriptionType?: TextTypes;
  testId?: string;
  maxWidth?: string | number;
  style?: CSSProperties | undefined;
  showOutOfSeries?: boolean;
  totalNumberSeries?: (string | undefined)[];
  totalNumberType?: TextTypes;
  replacements?: TextReplacements;
  isDateTime?: boolean;
  isPercentageFormat?: boolean;
  isTime?: boolean;
  className?: string;
  currencyISO?: string;
  locale?: string;
  showTotalNumberSeries?: boolean;
  showAvatar?: boolean;
  avatar?: IconNames;
}

export const BigLegendItem = (props: BigLegendItemProps) => {
  const {
    currentNumber,
    previousNumber,
    totalNumber,
    title,
    description,
    descriptionColor = '--fn-fg-light',
    descriptionType = TextTypes.textCaption,
    descriptionFont = FontWeights.regular,
    iconName,
    iconSize,
    iconFillColor = '--n300',
    showBadge,
    showPercentage = false,
    testId = 'BigLegendItem',
    previousNumberText = 'previously',
    showPreviousNumber = true,
    showPreviousNumberText = true,
    showPercentageFromTotal = false,
    topTitle,
    roundNumbers = false,
    formatWithCurrency = false,
    maxWidth = '300px',
    showOutOfSeries,
    totalNumberSeries = [],
    style,
    replacements,
    isDateTime = false,
    isPercentageFormat = false,
    isTime = false,
    className,
    showTotalNumberSeries = true,
    showAvatar = false,
    avatar,
    totalNumberType,
    locale,
    currencyISO,
  } = props;

  /**
   * State
   */
  const [percentage, setPercentage] = useState<string>('0%');
  const [totalPercentage, setTotalPercentage] = useState<string>('0%');
  const [icon, setIcon] = useState<IconNames>(IconNames.remove);
  const [status, setStatus] = useState<StatusBadgeStatus>('neutral');
  const [badgeText, setBadgeText] = useState<string>('no change');
  const currencyFormatter = useFormatNumberWithCurrency(locale, currencyISO);

  useEffect(() => {
    if (previousNumber) {
      let successNumber: string = '';
      let dangerNumber: string = '';
      let percentage: string = '';
      setIcon(IconNames.remove);
      setStatus('neutral');
      setBadgeText('no change');
      setPercentage('0%');

      if (currentNumber > previousNumber) {
        setIcon(IconNames.arrowUp);
        setStatus('success');
        successNumber = (((currentNumber - previousNumber) / previousNumber) * 100).toFixed(1);
        percentage = `${successNumber}%`;
        setBadgeText(successNumber === '0' ? percentage : `+${percentage}`);
        setPercentage(percentage);

        if (previousNumber === 0) {
          successNumber = ((currentNumber - previousNumber) * 100).toFixed(1);
          percentage = `${successNumber}%`;
          setBadgeText(successNumber === '0' ? percentage : `+${percentage}`);
          setPercentage(percentage);
        }
      }
      if (currentNumber < previousNumber) {
        setIcon(IconNames.arrowDown);
        setStatus('danger');
        dangerNumber = (((previousNumber - currentNumber) / previousNumber) * 100).toFixed(1);
        percentage = `${dangerNumber}%`;
        setBadgeText(dangerNumber === '0' ? percentage : `-${percentage}`);
        setPercentage(percentage);
      }
    }
  }, [currentNumber, previousNumber]);

  useEffect(() => {
    if (currentNumber === 0 || totalNumber === 0) {
      setTotalPercentage('0%');
    } else if (totalNumber) {
      setTotalPercentage(`${Math.round((currentNumber / totalNumber) * 100)}%`);
    }
  }, [currentNumber, totalNumber]);

  /**
   * Format data
   */
  function formatNumber(number: number, roundNumbers?: boolean) {
    if (isDateTime) {
      const dateTime = new Date(currentNumber);
      return `${dateTime.getMinutes()}m ${dateTime.getSeconds()}s`;
    }

    if (isPercentageFormat) {
      return `${number % 1 === 0 ? number : number.toFixed(2)}%`;
    }

    if (isTime) {
      return `${Math.floor(number / 60)}m ${Math.floor(number % 60)}s`;
    }

    if (formatWithCurrency) {
      return currencyFormatter(number, { numberOfDecimals: 2 });
    }

    if (roundNumbers) {
      return number < 1e3 ? number.toString() : `${parseFloat((number / 1e3).toFixed(2))}K`;
    }

    return number.toLocaleString();
  }

  /**
   * Return view
   * ---
   */
  return (
    <ComponentContainer testId={testId} style={{ maxWidth: maxWidth, ...style }} className={className}>
      <div className={classNames(styles.container)}>
        {iconName && (
          <div className={styles.iconContainer}>
            <Icon
              hasCircle={true}
              color={'--n000'}
              fillColor={iconFillColor}
              type={iconSize}
              circleSize={32}
              className={classNames(styles.icon)}
            >
              {iconName}
            </Icon>
          </div>
        )}

        <div>
          {typeof topTitle === 'string' ? (
            <Text fontWeight={FontWeights.bold} testId={`${testId}_topTitle`} replacements={replacements}>
              {topTitle}
            </Text>
          ) : (
            topTitle
          )}

          <div className={classNames(showOutOfSeries ? styles.dataOutOfSeries : styles.data)}>
            {showAvatar && (
              <span className={classNames(styles.avatar)}>
                <Avatar icon={avatar} size={'small'} />
              </span>
            )}
            {showTotalNumberSeries && (
              <span>
                <Text
                  type={totalNumberType ? totalNumberType : TextTypes.heading2}
                  fontWeight={FontWeights.bold}
                  color={'--fn-fg'}
                  testId={'BigLegendItem_FormattedNumber_TestId'}
                  translate={false}
                >
                  {totalNumberSeries.length ? totalNumberSeries[1] : formatNumber(currentNumber, roundNumbers)}
                </Text>
              </span>
            )}

            {showPercentageFromTotal && (
              <span className={classNames(styles.percentageContainer)}>
                <Text textTight={true} fontWeight={FontWeights.bold} color={'--n500'} translate={false}>
                  {totalPercentage}
                </Text>
              </span>
            )}

            {showPercentage && (
              <span className={classNames(styles.percentageContainer)}>
                <Text textTight={true} fontWeight={FontWeights.bold} color={'--n500'} translate={false}>
                  {percentage}
                </Text>
              </span>
            )}

            {showOutOfSeries && (
              <span className={classNames(dFlex, dFlexRow)}>
                <Text textTight={true} fontWeight={FontWeights.regular} color={'--n700'} translate={false}>
                  /
                </Text>
                <Text
                  textTight={true}
                  fontWeight={FontWeights.regular}
                  color={'--n700'}
                  replacements={{ total_number: totalNumberSeries[0] }}
                >
                  {'Out of %total_number%'}
                </Text>
              </span>
            )}

            <AnimatedConditional condition={previousNumber !== undefined}>
              <span className={classNames(styles.data)}>
                {showBadge && (
                  <span key={badgeText} className={styles.badge}>
                    <StatusBadge status={status} text={badgeText} icon={icon} iconVariant={'reverse'} />
                  </span>
                )}

                {showPreviousNumber && (
                  <span>
                    <Text textTight={true} fontWeight={FontWeights.bold} color={'--n400'} translate={false}>
                      {formatNumber(previousNumber ?? 0, roundNumbers)}
                    </Text>
                  </span>
                )}

                {showPreviousNumberText && (
                  <span>
                    <Text type={TextTypes.textCaption} color={'--n400'}>
                      {previousNumberText}
                    </Text>
                  </span>
                )}
              </span>
            </AnimatedConditional>
          </div>
        </div>
      </div>

      <div className={classNames(iconName ? styles.bottomContainerPadding : null)}>
        {title && (
          <Text
            type={TextTypes.textHelp}
            textTight={true}
            fontWeight={FontWeights.medium}
            color={'--n700'}
            replacements={replacements}
          >
            {title}
          </Text>
        )}

        {description && (
          <Text type={descriptionType} color={descriptionColor} fontWeight={descriptionFont}>
            {description}
          </Text>
        )}
      </div>
    </ComponentContainer>
  );
};
