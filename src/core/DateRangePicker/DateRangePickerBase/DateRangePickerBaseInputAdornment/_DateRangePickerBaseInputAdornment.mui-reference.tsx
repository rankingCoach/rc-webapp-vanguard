// Frozen MUI implementation (HEAD 19a8366) for the own-core differential; do not edit.
import { InputAdornment } from '@mui/material';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';

export interface DateRangePickerBaseInputAdornmentProps {
  onClick?: () => void;
}

export const DateRangePickerBaseInputAdornmentMuiReference = (props: DateRangePickerBaseInputAdornmentProps) => {
  const { onClick } = props;

  return (
    // TODO calendar icon should toggle the input
    <InputAdornment
      onClick={
        //   () => {
        //   setIsPopoverOpen(true);
        //   setIsPopoverFocused(false);
        // }
        () => onClick && onClick()
      }
      style={{ marginLeft: 0, marginRight: 16, height: 48, padding: 3 }}
      position="end"
    >
      <Icon forceSize={18} color={'--n400'} type={IconSize.small}>
        {IconNames.calendar}
      </Icon>
    </InputAdornment>
  );
};
