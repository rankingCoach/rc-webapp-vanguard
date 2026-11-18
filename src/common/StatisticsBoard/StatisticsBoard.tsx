import { StatisticsBoardItemPlaceholder } from '@common/StatisticsBoard/StatisticBoardItemPlaceholder/StatisticBoardItemPlaceholder';
import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Render } from '@vanguard/Render/Render';
import React from 'react';

import styles from './StatisticsBoard.module.scss';
import { StatisticsBoardItem, StatisticsBoardItemProps } from './StatisticsBoardItem/StatisticsBoardItem';

export interface StatisticsBoardProps {
  testId?: string;
  items: StatisticsBoardItemProps[];
  className?: string;
  isLoading?: boolean;
  isLoadingItemsNr?: number;
}

export const StatisticsBoard = (props: StatisticsBoardProps) => {
  const { testId = 'StatisticsBoard', items, className, isLoading = false, isLoadingItemsNr = 4 } = props;

  return (
    <ComponentContainer data-slot={'statistics-board'} className={classNames(styles.items, className)} testId={testId}>
      <Render if={isLoading}>
        {Array.from(Array(isLoadingItemsNr).keys()).map((index) => {
          return <StatisticsBoardItemPlaceholder key={index} />;
        })}
      </Render>
      <Render if={!isLoading}>
        {items &&
          items.length &&
          items.map((itemProps, index) => {
            return <StatisticsBoardItem key={index} {...itemProps} />;
          })}
      </Render>
    </ComponentContainer>
  );
};
