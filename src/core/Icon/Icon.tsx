import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import';
import { classNames } from '@helpers/classNames';
import { applyOpacity, parseColor } from '@helpers/color-helpers';
import { StyledSVG } from '@vanguard/StyledSVG/StyledSVG';
import React, { MutableRefObject } from 'react';

import styles from './Icon.module.scss';
import { IconNames } from './IconNames';

export enum IconSize {
  small = 'small',
  large = 'large',
}

export interface IconProps {
  children: IconNames | null;
  role?: 'button';
  spin?: boolean;
  type?: IconSize;
  className?: string;
  svgClassName?: string;
  color?: string;
  hoverColor?: string;
  fillColor?: string;
  hasCircle?: boolean;
  circleSize?: number;
  icnRef?: MutableRefObject<HTMLDivElement>;
  style?: React.CSSProperties;
  onClick?: (e?: any) => void;
  testId?: string;
  forceSize?: number | string;
  fillOpacity?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Icon = (props: IconProps) => {
  const {
    style,
    children,
    svgClassName = '',
    className = '',
    onClick,
    role,
    icnRef,
    hasCircle,
    testId,
    forceSize,
    circleSize,
    spin,
    onMouseEnter,
    onMouseLeave,
  } = props;

  let { type, color, fillColor, hoverColor, fillOpacity } = props;
  let extraStyles: React.CSSProperties = {
    display: 'inlineBlock',
    flexShrink: 0,
  };

  if (!type) type = IconSize.small;

  if (color) {
    // add support for css vars
    color = parseColor(color);
  } else {
    color = 'var(--n900)';
  }

  if (hoverColor) {
    // add support for css vars
    hoverColor = parseColor(hoverColor);
  } else {
    hoverColor = color;
  }

  if (hasCircle) {
    extraStyles = {
      ...extraStyles,
      border: `2px solid ${color}`,
      padding: 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      height: circleSize ? circleSize : 'auto',
      width: circleSize ? circleSize : 'auto',
    };
    if (fillColor) {
      fillColor = parseColor(fillColor);
      const fillColorWithOpacity = fillOpacity ? applyOpacity(fillColor, fillOpacity) : fillColor;
      extraStyles = {
        ...extraStyles,
        backgroundColor: fillColorWithOpacity,
        border: `2px solid ${fillColorWithOpacity}`,
        // backgroundClip: "padding-box", // Ensures the background color doesn't bleed into the border
      };
    }
  }
  const height = type === IconSize.small ? 16 : 24;
  const postfix = type === IconSize.small ? '' : '-1';

  const { SvgIcon, loading, error } = useDynamicImport(`icons/Icon-${children}${postfix}.svg`);
  if (error) {
    console.log(`Error loading icon ${children} with path icons/Icon-${children}${postfix}`);
  }

  if (!SvgIcon) {
    return null;
  }

  return (
    <span
      data-testid={testId}
      data-slot={'icon'}
      data-icon={children ?? undefined}
      data-size={type}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={classNames(className, spin ? styles.spin : '')}
      role={role}
      ref={icnRef as any}
      style={{
        ...style,
        ...extraStyles,
        // border:'1px solid red',
        // width: height,
        // height: height,
        display: 'flex',
      }}
    >
      <StyledSVG
        role={'figure'}
        testid={testId ? `${testId}-svg` : ''}
        hovercolor={hoverColor}
        className={svgClassName}
        width={forceSize ? forceSize : height}
        height={forceSize ? forceSize : height}
        color={color}
        src={SvgIcon}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    </span>
  );
};
