import './Alert.scss';

import React from 'react';

import { ComponentContainer } from '../ComponentContainer/ComponentContainer';
import { FontWeights, Text } from '../Text/Text';

export interface AlertProps {
  type: 'danger' | 'info' | 'warn' | 'success';
  children: string;
}

export const Alert = (props: AlertProps) => {
  const { type = 'info', children } = props;

  const colorBasedOnType = (type: 'danger' | 'info' | 'warn' | 'success') => {
    switch (type) {
      case 'danger':
        return '--e900';
      case 'info':
        return '--p900';
      case 'warn':
        return '--e900';
      case 'success':
        return '--s500';
      default:
        return '--p900'; // fallback to info color
    }
  };

  return (
    <ComponentContainer className={'Alert-container'} data-slot={'alert-container'}>
      <div className={`rc-alert rc-alert-${type}`} data-slot={'alert'} data-type={type}>
        <Text color={colorBasedOnType(type)} fontWeight={FontWeights.bold}>
          {children}
        </Text>
      </div>
    </ComponentContainer>
  );
};
