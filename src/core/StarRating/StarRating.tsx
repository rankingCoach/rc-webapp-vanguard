import { dataFlag } from '@helpers/data-attributes';
import { useHover } from '@custom-hooks/use-hover';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { parseCssVariable } from '../../helpers/css-variables-parser';
import { Star } from './Star/Star';
import { StarValueChangedEvent, StarValueChangedEventHandler } from './Star/Star.types';
import styles from './StarRating.module.scss';

export interface StarRatingProps {
  disabled?: boolean;
  readonly?: boolean;
  value: number;
  size: number;
  color?: string;
  bgColor?: string;
  bgHoverColor?: string;
  maxNumberOfStars?: number;
  isBlurred?: boolean;
  step?: number;
  onChange?: StarValueChangedEventHandler;
}

export const StarRating = (props: StarRatingProps) => {
  const { size, maxNumberOfStars = 5, isBlurred, readonly = true, step = 0.5, onChange } = props;
  let { value = 0, color, bgColor, bgHoverColor } = props;
  color = parseCssVariable(color);
  bgColor = parseCssVariable(bgColor);
  bgHoverColor = parseCssVariable(bgHoverColor);
  const [hoverValue, setHoverValue] = useState(0);
  const [isHoverInteractionEnabled, setIsHoverInteractionEnabled] = useState(!readonly);
  const container = useRef<HTMLDivElement>(null);
  const isContainerHovered = useHover(container);

  if (value > maxNumberOfStars) {
    value = maxNumberOfStars;
  }

  const extractUniqueValue = (value: number, pos: number) => {
    const realValue = value - pos;
    return realValue > 0 ? realValue : 0;
  };

  const getRatingValueFromEvent = (event: StarValueChangedEvent, index: number) =>
    step === 1
      ? Math.ceil(event.value + index)
      : Math.min(Math.ceil((event.value + index) / step) * step, maxNumberOfStars);

  const handleChange = (event: StarValueChangedEvent, index: number) => {
    if (readonly || !onChange) return;

    onChange({ value: getRatingValueFromEvent(event, index) });
    setIsHoverInteractionEnabled(false);
    setHoverValue(0);
    setTimeout(() => setIsHoverInteractionEnabled(!readonly), 2000);
  };

  const handleHoverChange = (event: StarValueChangedEvent, index: number) => {
    if (readonly || !isHoverInteractionEnabled) return;

    setHoverValue(getRatingValueFromEvent(event, index));
  };

  useEffect(() => {
    if (!isContainerHovered) setHoverValue(0);
  }, [isContainerHovered]);

  const starRatingClassName = useMemo(() => {
    const classes = [styles.starRating];
    if (!readonly) classes.push(styles.starRatingInteractive);
    return classes.join(' ');
  }, [readonly]);

  return (
    <div data-slot={'star-rating'} data-readonly={dataFlag(readonly)} className={starRatingClassName} ref={container} data-testid="star-rating" data-rating={value}>
      {[...Array(maxNumberOfStars)].map((item, index) => {
        return (
          <Star
            key={index}
            index={index}
            color={color}
            bgColor={bgColor}
            bgHoverColor={bgHoverColor}
            size={size}
            value={extractUniqueValue(value, index)}
            hoverValue={extractUniqueValue(hoverValue, index)}
            isBlurred={isBlurred}
            readonly={readonly}
            onChange={(e) => handleChange(e, index)}
            onHoverUpdate={(e) => handleHoverChange(e, index)}
          />
        );
      })}
    </div>
  );
};
