// Test-only reference: the former MUI implementation of Button (MUI Grow for the hover icon swap), verbatim apart
// from the rename and importing the shared enums/types from ./Button. Used by the parity spec and the Chromium
// differential story; not exported from the package.

import styles from './Button.module.scss';
import { useHover } from '@custom-hooks/use-hover';
import { classNames } from '@helpers/classNames';
import { Grow } from '@mui/material';
import React, { RefObject, useCallback, useRef, useState } from 'react';
import { Icon, IconSize } from '../Icon/Icon';
import { IconNames } from '../Icon/IconNames';
import { FontWeights, Text, TextReplacements, TextTypes } from '../Text/Text';
import { ButtonProps, ButtonSizes, ButtonTextColors, ButtonTypes } from './Button';

const TEXT_COLOR_CLASSES: Record<ButtonTextColors, string> = {
  [ButtonTextColors.ado]: styles.textColorAdo,
  [ButtonTextColors.neutral]: styles.textColorNeutral,
};

export const ButtonMui = (props: ButtonProps) => {
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
    translate = true,
    type = ButtonTypes.primary,
    size = ButtonSizes.medium,
    onClick,
    onMouseDown,
    uppercase,
    w100,
    shape = 'default',
    ariaLabel,
    htmlType,
  } = props;

  let { icon, iconPosition = 'left', rounded = false, iconColor, targetRef, iconHoverColor } = props;

  // Extract the variant-only props: blurred, onDark & pressed are muted-only, inverted is muted, primary & shimmer
  const blurred = 'blurred' in props ? props.blurred : false;
  const inverted = 'inverted' in props ? props.inverted : false;
  const onDark = 'onDark' in props ? props.onDark : false;
  const pressed = 'pressed' in props ? props.pressed : undefined;
  const isMuted = type === ButtonTypes.muted;
  const isFilledInverted = !!inverted && (type === ButtonTypes.primary || type === ButtonTypes.shimmer);
  const hasInvertedClass = isFilledInverted || (isMuted && !!inverted);
  // These colours live in CSS, the icon follows the text colour
  const iconFollowsText = isMuted || isFilledInverted;
  const textColor = type === ButtonTypes.default && 'textColor' in props ? props.textColor : undefined;

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
    } else if (isFilledInverted) {
      iconColor = 'currentColor';
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
          // The muted colours live in CSS (surface flags), the icon follows the text colour
          iconColor = 'currentColor';
          break;
      }
    }
  }

  if (!iconHoverColor) {
    if (hoverColor) {
      iconHoverColor = hoverColor;
    } else if (isFilledInverted) {
      iconHoverColor = 'currentColor';
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
          iconHoverColor = 'currentColor';
          break;
      }
    }
  } else if (isFilledInverted) {
    iconHoverColor = 'currentColor';
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
        iconHoverColor = 'currentColor';
        break;
    }
  }

  // A text colour lives in CSS (rest and hover); the icon follows the label unless an icon colour was given
  if (textColor) {
    iconColor = props.iconColor ?? 'currentColor';
    iconHoverColor = props.iconHoverColor ?? 'currentColor';
  }

  const getLabelColor = useCallback(() => {
    if (disabled || textColor) return undefined;
    return hoverColor ? (btnHovered ? hoverColor : color) : color;
  }, [disabled, textColor, btnHovered, hoverColor, color]);

  const getIconColor = useCallback(() => {
    // Muted & inverted keep following the text colour when disabled; the 0.4 opacity comes from CSS
    if (disabled) return iconFollowsText ? iconColor : undefined;
    return iconHoverColor ? (btnHovered ? iconHoverColor : iconColor) : iconColor;
  }, [disabled, iconFollowsText, btnHovered, iconHoverColor, iconColor]);

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
        type={htmlType}
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
          hasInvertedClass ? styles.inverted : '',
          isMuted && onDark ? styles.onDark : '',
          textColor ? TEXT_COLOR_CLASSES[textColor] : '',
        )}
        aria-pressed={isMuted ? pressed : undefined}
        aria-label={ariaLabel}
      >
        {isMuted && <span className={styles.buttonHoverLayer} aria-hidden="true" />}
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
              translate={translate}
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
