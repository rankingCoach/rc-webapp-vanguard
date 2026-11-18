import './ToggleButtonGroup.scss';

import { classNames } from '@helpers/classNames';
import React, { useCallback, useMemo, useRef } from 'react';
import { rovingFocusKeyDown } from '../../primitives/core/roving-focus';
import { nextExclusiveValue, nextMultipleValue } from '../../primitives/core/selection';
import { SxCompat, sxToStyle } from '../../primitives/react/sx-compat';
import {
  ToggleGroupContext,
  ToggleGroupContextValue,
  ToggleGroupPositionContext,
} from '../../primitives/react/ToggleGroup/toggle-group-context';
import { ComponentContainer } from '../ComponentContainer/ComponentContainer';

/** Same props as before (formerly MUI ToggleButtonGroupProps), now on Vanguard's own core. */
type Props = Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'color'> & {
  value?: any;
  onChange?: (event: React.MouseEvent<HTMLElement>, value: any) => void;
  exclusive?: boolean;
  orientation?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
  color?: 'standard' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  fullWidth?: boolean;
  disabled?: boolean;
  /** MUI `classes` keys (toggleButtonGroupClasses). */
  classes?: Partial<
    Record<
      | 'root'
      | 'selected'
      | 'horizontal'
      | 'vertical'
      | 'disabled'
      | 'grouped'
      | 'fullWidth'
      | 'firstButton'
      | 'lastButton'
      | 'middleButton',
      string
    >
  >;
  /** Accepts every MUI SxProps shape; only flat CSS objects apply (see sx-compat). */
  sx?: SxCompat;
  ref?: React.Ref<HTMLDivElement>;
  [dataAttr: `data-${string}`]: unknown;
  /**
   * `segmented`: a 32px muted track with the pressed item as a white glass chip; labels keep their case.
   * Holds text items and icon-only items (a single `Icon` child, painted in the item's text colour).
   */
  variant?: 'default' | 'segmented';
  /** Segmented only: the track and its items as pills. */
  rounded?: boolean;
  /** Segmented only: `large` is a 48px track with 16px labels, for a page's main switch (e.g. its sources). */
  segmentedSize?: 'default' | 'large';
};

const positionOf = (index: number, count: number): '' | 'first' | 'middle' | 'last' => {
  if (count === 1) return '';
  if (index === 0) return 'first';
  if (index === count - 1) return 'last';
  return 'middle';
};

export const ToggleButtonGroup = (props: Props) => {
  const {
    variant = 'default',
    rounded = false,
    segmentedSize = 'default',
    children,
    className,
    value,
    onChange,
    exclusive = false,
    orientation = 'horizontal',
    size = 'medium',
    color = 'standard',
    fullWidth = false,
    disabled = false,
    classes,
    sx,
    style,
    ref,
    onKeyDown,
    ...rest
  } = props;
  const isSegmented = variant === 'segmented';
  const rootRef = useRef<HTMLDivElement | null>(null);

  const handleChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, buttonValue: any) => {
      if (!onChange) return;
      onChange(event, exclusive ? nextExclusiveValue(value, buttonValue) : nextMultipleValue(value, buttonValue));
    },
    [onChange, exclusive, value],
  );

  const groupedClassName = classNames(
    'MuiToggleButtonGroup-grouped',
    disabled ? 'Mui-disabled' : '',
    classes?.grouped ?? '',
  );
  const context = useMemo<ToggleGroupContextValue>(
    () => ({
      value,
      onChange: handleChange,
      size,
      color,
      fullWidth,
      disabled,
      groupedClassName,
      positionClassNames: { first: classes?.firstButton, middle: classes?.middleButton, last: classes?.lastButton },
    }),
    [
      value,
      handleChange,
      size,
      color,
      fullWidth,
      disabled,
      groupedClassName,
      classes?.firstButton,
      classes?.middleButton,
      classes?.lastButton,
    ],
  );

  const validChildren = React.Children.toArray(children).filter(React.isValidElement);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (rootRef.current) {
      const rtl = getComputedStyle(rootRef.current).direction === 'rtl';
      rovingFocusKeyDown(event, { container: rootRef.current, orientation, rtl });
    }
  };

  const setRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <ComponentContainer
      className={classNames(
        'ToggleButtonGroup-container',
        isSegmented ? 'ToggleButtonGroup-segmented' : '',
        isSegmented && rounded ? 'ToggleButtonGroup-segmented-rounded' : '',
        isSegmented && segmentedSize === 'large' ? 'ToggleButtonGroup-segmented-large' : '',
      )}
    >
      <div
        role="group"
        data-slot="toggle-button-group"
        data-orientation={orientation}
        data-disabled={disabled ? '' : undefined}
        {...rest}
        ref={setRef}
        style={sx || style ? { ...sxToStyle(sx, 'ToggleButtonGroup'), ...style } : undefined}
        onKeyDown={handleKeyDown}
        className={classNames(
          'MuiToggleButtonGroup-root',
          `MuiToggleButtonGroup-${orientation}`,
          fullWidth ? 'MuiToggleButtonGroup-fullWidth' : '',
          classes?.root ?? '',
          classes?.[orientation] ?? '',
          fullWidth ? (classes?.fullWidth ?? '') : '',
          className,
        )}
      >
        <ToggleGroupContext.Provider value={context}>
          {validChildren.map((child, index) => (
            <ToggleGroupPositionContext.Provider
              key={child.key ?? index}
              value={positionOf(index, validChildren.length)}
            >
              {child}
            </ToggleGroupPositionContext.Provider>
          ))}
        </ToggleGroupContext.Provider>
      </div>
    </ComponentContainer>
  );
};
