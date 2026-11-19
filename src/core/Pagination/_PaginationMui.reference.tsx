// Test-only reference: the former MUI implementation of Pagination, verbatim (rename only). Used by the parity spec
// and the Chromium differential story; not exported from the package.

import styles from './Pagination.module.scss';
import { classNames } from '@helpers/classNames';
import { Pagination as MuiPagination } from '@mui/material';
import React from 'react';
import type { PaginationProps } from './Pagination';

export const PaginationMui = (props: PaginationProps) => {
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
