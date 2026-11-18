import { dFlex, dFlexRow, w100 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { dataFlag } from '@helpers/data-attributes';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Text } from '@vanguard/Text/Text';
import React, { Dispatch, SetStateAction, useState } from 'react';

import styles from './TogglerWithText.module.scss';

export interface TogglerWithTextProps {
  left: TogglerOption;
  right: TogglerOption;
  togglerState: TogglerState;
  onChange?: (selection: string) => void;
  testId?: string;
  activeBgColor?: string;
  bgColor?: string;
  activeTextColor?: string;
  textColor?: string;
  setLeftActive?: Dispatch<SetStateAction<boolean>>;
  className?: string;
  theme?: 'square' | 'default';
}

export type TogglerState = 'left' | 'right';

export type TogglerOption =
  | {
      component?: React.ReactNode;
      value: string;
    }
  | string;

const TogglerOption = (child: TogglerOption, active: boolean, activeTextColor: string, textColor: string) => {
  const color = active ? activeTextColor : textColor;
  if (typeof child === 'string') {
    return <Text color={color}>{child}</Text>;
  }
  if (!child.component) {
    return <Text color={color}>{child.value}</Text>;
  }
  return child.component;
};

export const TogglerWithText = (props: TogglerWithTextProps) => {
  const {
    onChange,
    left,
    right,
    testId,
    togglerState,
    activeBgColor = '--n000',
    bgColor = '--n200',
    activeTextColor = '--n700',
    textColor = '--n500',
    setLeftActive,
    className,
    theme = 'default',
  } = props;
  const [state, setState] = useState<TogglerState>(togglerState);

  const onClick = (value: TogglerState, componentValue: TogglerOption, setLeftActive: any) => {
    setState(value);
    if (setLeftActive) {
      setLeftActive(value == 'left');
    }
    onChange && onChange(getValueFromOption(componentValue));
  };

  const getValueFromOption = (togglerOption: TogglerOption): string => {
    if (typeof togglerOption === 'string') {
      return togglerOption;
    }
    return togglerOption.value;
  };

  return (
    <ComponentContainer
      data-slot="toggler-with-text"
      data-variant={theme}
      className={classNames(
        theme == 'default' ? styles.vanguardToggler : styles.vanguardTogglerSquare,
        className ? className : '',
      )}
      style={{ backgroundColor: `var(${bgColor})` }}
      testId={testId}
    >
      <div data-slot="toggler-with-text-slider" className={classNames(styles.slider, dFlex, dFlexRow, w100)}>
        <div
          data-slot="toggler-with-text-left"
          data-active={dataFlag(state === 'left')}
          data-testid={'left'}
          className={classNames(state == 'left' ? styles.active : null, styles.sliderOptionLeft)}
          style={state == 'left' ? { backgroundColor: `var(${activeBgColor})` } : {}}
          onClick={() => onClick('left', left, setLeftActive)}
        >
          {TogglerOption(left, state === 'left', activeTextColor, textColor)}
        </div>
        <div
          data-slot="toggler-with-text-right"
          data-active={dataFlag(state === 'right')}
          data-testid={'right'}
          className={classNames(state == 'right' ? styles.active : null, styles.sliderOptionRight)}
          style={state == 'right' ? { backgroundColor: `var(${activeBgColor})` } : {}}
          onClick={() => onClick('right', right, setLeftActive)}
        >
          {TogglerOption(right, state === 'right', activeTextColor, textColor)}
        </div>
      </div>
    </ComponentContainer>
  );
};
