import { classNames } from '@helpers/classNames';
import { parseCssVariable } from '@helpers/css-variables-parser';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { StarRating, StarRatingProps } from '@vanguard/StarRating/StarRating';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './Rating.module.scss';

export interface RatingProps extends StarRatingProps {
  className?: string;
  type?: 'stars' | 'emoji';
  valueColor?: string;
  bgColor?: string;
  valueAlign?: 'left' | 'right' | 'top';
  valueSize?: number;
  isBlurred?: boolean;
}

export const Rating = (props: RatingProps) => {
  // default values
  const {
    type = 'stars',
    size = '20',
    color = '--p800',
    valueAlign = 'left',
    valueColor = '--fn-bg',
    valueSize = null,
    className,
    bgColor,
    isBlurred,
  } = props;

  let { value = 0 } = props;

  if (parseFloat(String(value)) > 5) {
    value = 5.0;
  }
  const floatValue = value.toFixed(1);
  const customProps = { ...props };

  const getStyles = () => {
    const styles: Partial<React.CSSProperties> = {};

    if (isBlurred) {
      styles.filter = 'blur(12px)';
      styles.userSelect = 'none';
    }

    if (valueColor) {
      styles.color = parseCssVariable(valueColor);
    }
    if (size) {
      styles.fontSize = `${parseInt(String(size)) * 0.9}px`;
    }
    if (valueSize) styles.fontSize = `${valueSize}px`;

    styles.fontWeight = 'bold';
    styles.padding = '0 5px';

    return styles;
  };

  return (
    <ComponentContainer data-slot={'rating-container'} className={classNames(className)}>
      <div data-slot={'rating'} className={classNames(styles.container, valueAlign == 'top' ? styles.ratingAlignTop : '')}>
        {valueAlign && valueAlign == 'left' ? (
          <span data-slot={'rating-value'} className={classNames()} style={getStyles()}>
            {floatValue}
          </span>
        ) : null}
        {valueAlign && valueAlign == 'top' ? (
          <Text isBlurred={isBlurred} fontWeight={FontWeights.bold} type={TextTypes.heading2} translate={false}>
            {floatValue}
          </Text>
        ) : null}
        <StarRating
          disabled={props.disabled}
          readonly={props.readonly}
          value={value}
          color={color}
          bgColor={bgColor}
          isBlurred={isBlurred}
          size={props.size ?? 24}
        />
        {valueAlign && valueAlign == 'right' ? (
          <span data-slot={'rating-value'} className={styles.ratingValue} style={getStyles()}>
            {floatValue}
          </span>
        ) : null}
      </div>
    </ComponentContainer>
  );
};
