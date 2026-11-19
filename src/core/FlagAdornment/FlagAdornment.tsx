import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import';
import { pl2 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import React from 'react';
import { InputAdornment } from '../../primitives/react/TextField/InputAdornment';

export interface FlagAdornmentProps {
  countryCode: string;
}

export const FlagAdornment = (props: FlagAdornmentProps) => {
  const { countryCode } = props;
  const { SvgIcon, loading, error } = useDynamicImport(`flags/${countryCode}.png`);
  return (
    <InputAdornment position="start" className={classNames(pl2)}>
      <img src={SvgIcon} width={32} height={24} alt={`${countryCode} flag`} />
    </InputAdornment>
  );
};
