import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import React from 'react';

export interface SmallLoaderProps {
  variant?: 'color' | 'b&w' | undefined;
}

export const SmallLoader = (props: SmallLoaderProps) => {
  const { variant } = props;

  const colorBasedOnVariant = (variant: 'color' | 'b&w' | undefined) => {
    switch (variant) {
      case 'b&w':
        return 'bw_loading_dots';
      case 'color':
      default:
        return 'color_loading_dots';
    }
  };

  const { SvgIcon, loading, error } = useDynamicImport(`gifs/${colorBasedOnVariant(variant)}.gif`);

  return (
    <ComponentContainer data-slot={'small-loader'} style={{ padding: 5 }}>
      <img data-slot={'small-loader-image'} style={{ width: 25, height: 15 }} src={SvgIcon} alt={''} />
    </ComponentContainer>
  );
};
