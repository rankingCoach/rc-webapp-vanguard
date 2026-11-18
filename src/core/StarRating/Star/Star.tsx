import './Star.scss';

import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { StyledSVG } from '../../StyledSVG/StyledSVG';
import { StarValueChangedEventHandler } from './Star.types';

interface Props {
  /**
   *.
   * */
  disabled?: boolean;
  readonly?: boolean;
  value: number;
  index?: number;
  hoverValue?: number;
  size?: number;
  color?: string;
  bgColor?: string;
  bgHoverColor?: string;
  isBlurred?: boolean;
  onChange?: StarValueChangedEventHandler;
  onHoverUpdate?: StarValueChangedEventHandler;
}

export const Star = (props: Props) => {
  const { index, color, bgColor, bgHoverColor, isBlurred, readonly = true, onChange, onHoverUpdate } = props;
  let { size = 16.82, value = 0.5, hoverValue = 0 } = props;
  const star = useRef<HTMLSpanElement>(null);
  const starResult = useRef<HTMLSpanElement>(null);
  const starHover = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, [size]);

  if (value > 1) {
    value = 1;
  }
  if (hoverValue > 1) {
    hoverValue = 1;
  }
  size = size + 1;

  const { SvgIcon, loading, error } = useDynamicImport('star.svg');

  const indexBasedProps = useMemo(
    () =>
      index === undefined
        ? {}
        : {
            'aria-label': `${index + 1} star(s)`,
            'data-testid': `star-${index}`,
          },
    [index],
  );

  const getValueFromMousePosition = (event: React.MouseEvent) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - left;
    const newValue = clickX / width;
    return newValue;
  };

  const handleClick: React.MouseEventHandler = (event) => {
    if (readonly || !onChange) {
      return;
    }

    onChange({ value: getValueFromMousePosition(event) });
  };

  const handleMouseOver: React.MouseEventHandler = (event) => {
    if (readonly || !onHoverUpdate) return;
    const newHoverValue = getValueFromMousePosition(event);
    if (newHoverValue !== hoverValue) {
      onHoverUpdate({ value: newHoverValue });
    }
  };

  return (
    <div
      data-slot={'star'}
      style={{ display: visible ? '' : 'none', filter: isBlurred ? 'blur(3px)' : '' }}
      className="rating"
      onClick={handleClick}
      onMouseMove={handleMouseOver}
      role="checkbox"
      aria-checked={value === 1 ? true : value === 0 ? false : 'mixed'}
      {...indexBasedProps}
    >
      <span data-slot={'star-result'} style={{ width: size * value, height: size }} ref={starResult} className="rating__result">
        <StyledSVG width={size} height={size} color={color ? color : 'var(--p500)'} src={SvgIcon} />
      </span>
      <span data-slot={'star-hover'} style={{ width: size * hoverValue, height: size }} ref={starHover} className="rating__result">
        <StyledSVG
          width={size}
          height={size}
          color={bgHoverColor ? bgHoverColor : 'var(--white)'}
          src={SvgIcon}
          fillOpacity={bgHoverColor ? '1' : '0.2'}
        />
      </span>
      <span data-slot={'star-background'} style={{ width: size, height: size }} ref={star} className="rating__max">
        <StyledSVG width={size} height={size} color={bgColor ? bgColor : 'var(--n200)'} src={SvgIcon} />
      </span>
    </div>
  );
};
