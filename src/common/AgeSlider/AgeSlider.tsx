import { alignItemsCenter, dFlex, dFlexRow, gap3, justifyContentCenter } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Input } from '@vanguard/Input/Input';
import { Slider } from '@vanguard/Slider/Slider';
import React, { useState } from 'react';

import styles from './AgeSlider.module.scss';

export interface AgeSliderProps {
  minAge: number;
  maxAge: number;
  ageRange: number[];
  onSlideChange?: (min: number, max: number) => void;
}

export const AgeSlider = (props: AgeSliderProps) => {
  const { minAge, ageRange, maxAge, onSlideChange } = props;
  const [range, setRange] = useState<number[]>([ageRange[0], ageRange[1]]);

  const handleChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      onSlideChange && onSlideChange(newValue[0], newValue[1]);
      setRange(newValue);
    }
  };
  const handleMinAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMinAge: number = parseInt(event.target.value);
    if (newMinAge < range[1]) {
      setRange([newMinAge, range[1]]);
    }
  };
  const handleMaxAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMaxAge: number = parseInt(event.target.value);

    if (newMaxAge > range[0]) {
      setRange([range[0], newMaxAge]);
    }
  };
  return (
    <ComponentContainer data-slot={'age-slider'} className={classNames(dFlex, dFlexRow, alignItemsCenter, justifyContentCenter, gap3)}>
      <Input className={styles.input} type={'text'} value={range[0]} onChange={handleMinAgeChange} required={true} />
      <Slider onChange={handleChange} type={'primary'} value={range} min={minAge} max={maxAge} />
      <Input
        className={styles.input}
        type={'text'}
        value={range[1] === maxAge ? `${maxAge}+` : range[1]}
        onChange={handleMaxAgeChange}
        required={true}
      />
    </ComponentContainer>
  );
};
