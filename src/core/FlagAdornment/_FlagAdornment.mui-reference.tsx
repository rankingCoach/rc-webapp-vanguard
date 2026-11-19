// Frozen MUI implementation (HEAD 372ae98) for the own-core differential; do not edit.
import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import';
import { pl2 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { InputAdornment } from '@mui/material';
import React from 'react';

export interface FlagAdornmentProps {
  countryCode: string;
}

export const FlagAdornmentMuiReference = (props: FlagAdornmentProps) => {
  const { countryCode } = props;
  const { SvgIcon, loading, error } = useDynamicImport(`flags/${countryCode}.png`);
  return (
    <InputAdornment position="start" className={classNames(pl2)}>
      <img src={SvgIcon} width={32} height={24} alt={`${countryCode} flag`} />
    </InputAdornment>
  );
};
