import { dFlex, mr2, mt2, w100 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Skeleton, SkeletonTypes } from '@vanguard/Skeleton/Skeleton';
import React from 'react';

export interface TablePlaceholderProps {}

export const TablePlaceholder = (props: TablePlaceholderProps) => {
  const {} = props;

  return (
    <ComponentContainer data-slot={'table-placeholder'} className={w100}>
      <div data-slot={'table-placeholder-content'} className={classNames(dFlex, mt2, w100)}>
        <Skeleton
          type={SkeletonTypes.fill}
          style={{ height: '128px', minWidth: 'calc(33.33% - 16px)', width: 'auto' }}
          className={classNames(mr2)}
        />
        <Skeleton
          type={SkeletonTypes.fill}
          style={{ height: '128px', minWidth: 'calc(33.33% - 16px)', width: 'auto' }}
          className={classNames(mr2)}
        />
        <Skeleton
          type={SkeletonTypes.fill}
          style={{ height: '128px', minWidth: '33.33%', width: 'auto' }}
          className={''}
        />
      </div>
    </ComponentContainer>
  );
};

export const TableRowPlaceholder = (props: TablePlaceholderProps) => {
  const {} = props;

  return (
    <ComponentContainer data-slot={'table-row-placeholder'} className={w100}>
      <div data-slot={'table-row-placeholder-content'} className={classNames(dFlex, mt2, w100)}>
        <Skeleton
          type={SkeletonTypes.fill}
          style={{ height: '128px', minWidth: '100%', width: '1000px' }}
          className={classNames(mr2)}
        />
      </div>
    </ComponentContainer>
  );
};
