// Test-only reference: the former MUI implementation of Breadcrumbs, verbatim (rename only). Used by the parity spec
// and the Chromium differential story; not exported from the package.

import styles from './Breadcrumbs.module.scss';
import { classNames } from '@helpers/classNames';
import { Breadcrumbs as MuiBreadcrumbs } from '@mui/material';
import React from 'react';
import type { BreadcrumbsProps } from './Breadcrumbs';

export const BreadcrumbsMui = (props: BreadcrumbsProps) => {
  const {
    children,
    separator = '/',
    maxItems,
    itemsBeforeCollapse,
    itemsAfterCollapse,
    className,
    testId = 'breadcrumbs',
    'aria-label': ariaLabel = 'breadcrumb',
  } = props;
  return (
    <MuiBreadcrumbs
      separator={separator}
      maxItems={maxItems}
      itemsBeforeCollapse={itemsBeforeCollapse}
      itemsAfterCollapse={itemsAfterCollapse}
      aria-label={ariaLabel}
      data-testid={testId}
      className={classNames(styles.breadcrumbs, 'vanguard-breadcrumbs', className)}
    >
      {children}
    </MuiBreadcrumbs>
  );
};
