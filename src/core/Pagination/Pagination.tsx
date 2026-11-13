import { classNames } from '@helpers/classNames';
import { Pagination as MuiPagination } from '@mui/material';
import React from 'react';

import styles from './Pagination.module.scss';

export interface PaginationProps {
  /** Number of pages. */
  count: number;
  /** Current page, 1-based (controlled). */
  page?: number;
  /** Initial page, 1-based (uncontrolled). Default 1. */
  defaultPage?: number;
  /** Called with the new 1-based page. */
  onChange?: (event: React.ChangeEvent<unknown>, page: number) => void;
  /** Default 'circular'. */
  shape?: 'circular' | 'rounded';
  /** Default 'medium'. */
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  /** Pages shown on each side of the current page. Default 1. */
  siblingCount?: number;
  /** Pages always shown at the start and end. Default 1. */
  boundaryCount?: number;
  showFirstButton?: boolean;
  showLastButton?: boolean;
  hidePrevButton?: boolean;
  hideNextButton?: boolean;
  className?: string;
  testId?: string;
}

export const Pagination = (props: PaginationProps) => {
  const {
    count,
    page,
    defaultPage,
    onChange,
    shape = 'circular',
    size = 'medium',
    disabled,
    siblingCount,
    boundaryCount,
    showFirstButton,
    showLastButton,
    hidePrevButton,
    hideNextButton,
    className,
    testId = 'pagination',
  } = props;
  return (
    <MuiPagination
      count={count}
      page={page}
      defaultPage={defaultPage}
      onChange={onChange}
      shape={shape}
      size={size}
      disabled={disabled}
      siblingCount={siblingCount}
      boundaryCount={boundaryCount}
      showFirstButton={showFirstButton}
      showLastButton={showLastButton}
      hidePrevButton={hidePrevButton}
      hideNextButton={hideNextButton}
      data-testid={testId}
      className={classNames(styles.pagination, 'vanguard-pagination', className)}
    />
  );
};
