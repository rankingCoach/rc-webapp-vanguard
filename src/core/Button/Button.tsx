import { useHover } from '@custom-hooks/use-hover';
import { classNames } from '@helpers/classNames';
import { Grow } from '@mui/material';
import React, { RefObject, useCallback, useRef, useState } from 'react';

import { Icon, IconSize } from '../Icon/Icon';
import { IconNames } from '../Icon/IconNames';
import { FontWeights, Text, TextReplacements, TextTypes } from '../Text/Text';
import styles from './Button.module.scss';

/**
 * Types
 */
export enum ButtonSizes {
  small = 'small',
  medium = 'medium',
  large = 'large',
  /** @remarks only available for the muted button type */
  extraLarge = 'extra-large',
}

export enum ButtonTypes {
  default = 'default',
  secondary = 'secondary',
  primary = 'primary',
  shimmer = 'shimmer',
  muted = 'muted',
}

type eventFn = (event: React.MouseEvent) => void;
type simpleFn = () => void;

export type ButtonShape = 'default' | 'round';

/**
 * Props
 * ---------------------------------------------------------------------------------------------------------------------
 */
interface CommonButtonProps {
  testId?: string;
  /** @deprecated */
  className?: string;
  children?: string;
  targetRef?: RefObject<HTMLSpanElement>;

  /** @deprecated */
  color?: string;
  /** @deprecated */
  hoverColor?: string;
  /** @deprecated */
  fontWeight?: FontWeights;
  /** @deprecated */
  textType?: TextTypes;
  /** @deprecated use `rounded` prop instead */
  shape?: ButtonShape;
  rounded?: boolean;
  /**
   * Controls how a long label behaves.
   * - `no-wrap` (default): the label stays on a single line.
   * - `wrap`: the label wraps onto multiple lines and the button grows in height.
   *   The button is capped to its parent's width so wrapping kicks in once the label no longer fits.
   *   Words are only broken when a single word is wider than the button; inside a flex row, give the
   *   button's parent `min-width: 0` if it must shrink below its longest word.
   */
  textWrap?: 'wrap' | 'no-wrap';

  /** @deprecated use `icon` and `iconPosition` props instead */
  iconLeft?: IconNames;
  /** @deprecated use `icon` and `iconPosition` props instead */
  iconRight?: IconNames;
  /** @deprecated */
  iconSize?: IconSize;
  /** @deprecated */
  iconColor?: string;
  /** @deprecated */
  iconHoverColor?: string;
  /** @deprecated */
  iconFillColor?: string;
  /** @deprecated */
  iconLargeOnHover?: boolean;
  iconHasCircle?: boolean;
  icon?: IconNames;
  iconPosition?: 'left' | 'right';

  w100?: boolean;

  isLoading?: boolean;
  disabled?: boolean;
  visible?: boolean;
  uppercase?: boolean;

  replacements?: TextReplacements;

  onClick?: eventFn | simpleFn;
  onMouseDown?: eventFn | simpleFn;
  debounce?: number;
}

type BaseButtonProps = CommonButtonProps & {
  type?: Exclude<ButtonTypes, ButtonTypes.muted>;
  size?: Exclude<ButtonSizes, ButtonSizes.extraLarge>;
  // these are specifically forbidden for the non-muted button
  blurred?: never;
  inverted?: never;
};

type MutedButtonProps = CommonButtonProps & {
  type: Extract<ButtonTypes, ButtonTypes.muted>;
  size?: ButtonSizes;
  blurred?: boolean;
  inverted?: boolean;
};

export type ButtonProps = BaseButtonProps | MutedButtonProps;

/**
 * Component
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const Button = (props: ButtonProps) => {
  const {
    iconLeft,
    iconRight,
    children,
    disabled,
    debounce,
    textWrap = 'no-wrap',
    fontWeight,
    textType,
    className,
    visible,
    iconSize,
    iconFillColor,
    iconHasCircle,
    iconLargeOnHover,
    color,
    hoverColor,
    isLoading,
    testId,
    replacements,
    type = ButtonTypes.primary,
    size = ButtonSizes.medium,
    onClick,
    onMouseDown,
    uppercase,
    w100,
    shape = 'default',
  } = props;

  let { icon, iconPosition = 'left', rounded = false, iconColor, targetRef, iconHoverColor } = props;

  // Extract blurred and inverted props for muted buttons
  const blurred = 'blurred' in props ? props.blurred : false;
  const inverted = 'inverted' in props ? props.inverted : false;

  // Maintain support for iconLeft & iconRight props, but only use icon internally;
  // icon props takes precedence over iconLeft/iconRight and iconRight over iconLeft.
  if (!icon) {
    if (iconLeft) {
      icon = iconLeft;
      iconPosition = 'left';
    }

    if (iconRight) {
      icon = iconRight;
      iconPosition = 'right';
    }
  }

  // Maintain support for shape prop, but only use rounded internally;
  rounded = rounded || shape === 'round';

  const [lastClick, setLastClick] = useState(0);
  // Refs
  const tmpRef = useRef(null);
  if (!targetRef) {
    targetRef = tmpRef;
  }
  const btnRef: RefObject<HTMLButtonElement> = useRef(null);

  // Js Hover State
  const btnHovered = useHover(targetRef);

  // Default loading button
  if (isLoading && !icon && !iconColor) {
    icon = IconNames.save;
  }

  /**
   * Label & Icon Color
   */
  if (!iconColor) {
    if (color) {
      iconColor = color;
    } else {
      switch (type) {
        case ButtonTypes.default:
          iconColor = '--button-default-text-color';
          break;
        case ButtonTypes.secondary:
          iconColor = '--button-secondary-text-color';
          break;
        case ButtonTypes.primary:
          iconColor = '--button-primary-text-color';
          break;
        case ButtonTypes.shimmer:
          iconColor = '--button-shimmer-text-color';
          break;
        case ButtonTypes.muted:
          iconColor = inverted ? '--button-muted-inverted-text-color' : '--button-muted-text-color';
          break;
      }
    }
  }

  if (!iconHoverColor) {
    if (hoverColor) {
      iconHoverColor = hoverColor;
    } else {
      switch (type) {
        case ButtonTypes.default:
          iconHoverColor = '--button-default-hover-text-color';
          break;
        case ButtonTypes.secondary:
          iconHoverColor = '--button-secondary-hover-text-color';
          break;
        case ButtonTypes.primary:
          iconHoverColor = '--button-primary-hover-text-color';
          break;
        case ButtonTypes.shimmer:
          iconHoverColor = '--button-shimmer-hover-text-color';
          break;
        case ButtonTypes.muted:
          iconColor = inverted ? '--button-muted-inverted-text-color' : '--button-muted-text-color';
          break;
      }
    }
  } else {
    switch (type) {
      case ButtonTypes.default:
        iconHoverColor = '--button-default-hover-text-color';
        break;
      case ButtonTypes.secondary:
        iconHoverColor = '--button-default-text-color';
        break;
      case ButtonTypes.primary:
        iconHoverColor = '--button-primary-text-color';
        break;
      case ButtonTypes.shimmer:
        iconHoverColor = '--button-shimmer-text-color';
        break;
      case ButtonTypes.muted:
        iconColor = inverted ? '--button-muted-inverted-text-color' : '--button-muted-text-color';
        break;
    }
  }

  const getLabelColor = useCallback(() => {
    if (disabled) return undefined;
    return hoverColor ? (btnHovered ? hoverColor : color) : color;
  }, [disabled, btnHovered, hoverColor, color]);

  const getIconColor = useCallback(() => {
    if (disabled) return undefined;
    return iconHoverColor ? (btnHovered ? iconHoverColor : iconColor) : iconColor;
  }, [disabled, btnHovered, iconHoverColor, iconColor]);

  /**
   * Get Button Icon
   */

  const getButtonIconSize = () => {
    if (iconSize) {
      return iconSize;
    }
    return IconSize.small;
  };

  const isIconSizeDifferentOnHover = () => {
    if (iconSize === 'large') {
      return false;
    }
    return iconLargeOnHover;
  };

  const getButtonTypeClass = (): string => {
    switch (type) {
      case ButtonTypes.default:
        return styles.buttonDefault;
      case ButtonTypes.primary:
        return styles.buttonPrimary;
      case ButtonTypes.secondary:
        return styles.buttonSecondary;
      case ButtonTypes.shimmer:
        return styles.buttonShimmer;
      case ButtonTypes.muted:
        return styles.buttonMuted;
      default:
        return styles.buttonPrimary;
    }
  };

  const getSizeClass = (): string => {
    switch (size) {
      case ButtonSizes.small:
        return styles.sizeSmall;
      case ButtonSizes.medium:
        return styles.sizeMedium;
      case ButtonSizes.large:
        return styles.sizeLarge;
      case ButtonSizes.extraLarge:
        return styles.sizeExtraLarge;
      default:
        return styles.sizeMedium;
    }
  };

  const BtnIcon = (iconName?: IconNames, enlargeable = false, isLarge = false) => {
    if (!iconName) return null;
    return (
      <span className={enlargeable || isLarge ? styles.buttonIconContainer : ''}>
        <Icon
          type={isLarge ? IconSize.large : getButtonIconSize()}
          className={classNames(styles.buttonIcon, isLoading ? styles.loaderSpinner : '')}
          color={getIconColor()}
          fillColor={iconFillColor}
          hasCircle={disabled || isLoading ? false : iconHasCircle}
          testId={testId ? `${testId}_icon` : ''}
        >
          {iconName}
        </Icon>
      </span>
    );
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (debounce) {
      const now = Date.now();

      if (now - lastClick < debounce) {
        return;
      }
      setLastClick(now);
    }
    if (disabled || isLoading) {
      return;
    }

    // Blur
    if (btnRef && btnRef.current) {
      btnRef?.current?.blur();
    }

    // Callback
    onClick && onClick(e);
  };

  const handleOnMouseDown: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    if (disabled || isLoading) {
      return;
    }

    // Callback
    onMouseDown && onMouseDown(e);
  };

  /**
   * Button Hidden
   */
  if (visible === false) {
    return null;
  }

  /**
   * -------------------------------------------------------------------------------------------------------------------
   * Return View
   * -------------------------------------------------------------------------------------------------------------------
   */
  return (
    <span
      data-testid={testId}
      ref={targetRef}
      className={classNames(styles.buttonContainer, w100 ? styles.buttonContainerFullWidth : '')}
      onClick={handleButtonClick}
      onMouseDown={handleOnMouseDown}
    >
      <button
        ref={btnRef}
        data-testid={`${testId ? `${testId}_` : ''}button`}
        disabled={!!disabled}
        className={classNames(
          'material-ripple',
          styles.button,
          getButtonTypeClass(),
          getSizeClass(),
          className ? className : '',
          children && children?.length ? '' : styles.buttonLabelHidden,
          icon && iconPosition === 'left' ? styles.hasIconLeft : '',
          icon && iconPosition === 'right' ? styles.hasIconRight : '',
          rounded ? styles.shapeRound : '',
          textWrap === 'wrap' ? styles.buttonTextWrap : '',
          blurred ? styles.blurred : '',
          inverted ? styles.inverted : '',
        )}
      >
        <div className={styles.buttonInnerContainer}>
          {icon && iconPosition === 'left' ? (
            isIconSizeDifferentOnHover() && !isLoading && !disabled ? (
              <div className={styles.iconOnHoverContainer}>
                <div className={styles.iconSmallOnHover}>
                  <Grow in={!btnHovered}>{BtnIcon(icon, true) ?? <></>}</Grow>
                </div>
                <div className={styles.iconLargeOnHover}>
                  <Grow in={btnHovered}>{BtnIcon(icon, false, true) ?? <></>}</Grow>
                </div>
              </div>
            ) : (
              BtnIcon(icon)
            )
          ) : null}

          {children && (
            <Text
              replacements={replacements}
              // Forward the raw prop (not the defaulted value) so the rendered Text markup stays unchanged for existing buttons
              textWrap={props.textWrap}
              type={textType ? textType : undefined}
              fontWeight={fontWeight ? fontWeight : FontWeights.medium}
              className={styles.buttonText}
              color={getLabelColor()}
              uppercase={uppercase}
            >
              {children}
            </Text>
          )}

          {icon && iconPosition === 'right' ? (
            isIconSizeDifferentOnHover() && !isLoading && !disabled ? (
              <div className={styles.iconOnHoverContainer}>
                <div className={styles.iconSmallOnHover}>
                  <Grow in={!btnHovered}>{BtnIcon(icon, true) ?? <></>}</Grow>
                </div>
                <div className={styles.iconLargeOnHover}>
                  <Grow in={btnHovered}>{BtnIcon(icon, false, true) ?? <></>}</Grow>
                </div>
              </div>
            ) : (
              BtnIcon(icon)
            )
          ) : null}
        </div>
      </button>
    </span>
  );
};
