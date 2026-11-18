import { classNames } from '@helpers/classNames';
import { roundNumber } from '@helpers/round-number';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './DiscountBadge.module.scss';

export interface DiscountBadgeProps {
  className?: string;
  percentValue: number;
  resellerName: string;
}

export const DiscountBadge = (props: DiscountBadgeProps) => {
  const { className, percentValue, resellerName } = props;

  return (
    <ComponentContainer data-slot={'discount-badge'} className={classNames(styles.badge, className)}>
      <div data-slot={'discount-badge-border'} className={styles.dashedBorder} />
      <Text testId={'discount'} type={TextTypes.heading4} fontWeight={FontWeights.bold} color={'var(--fn-bg)'}>
        {roundNumber(percentValue, 0)}%
      </Text>
      <Text
        testId={'description'}
        type={TextTypes.textHelp}
        textAlign={'center'}
        textTight={true}
        fontWeight={FontWeights.bold}
        color={'var(--fn-bg)'}
      >
        Special offer for {resellerName} clients
      </Text>
    </ComponentContainer>
  );
};
