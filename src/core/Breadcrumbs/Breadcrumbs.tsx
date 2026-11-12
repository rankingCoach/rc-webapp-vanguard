import { classNames } from '@helpers/classNames';
import { Breadcrumbs as MuiBreadcrumbs } from '@mui/material';
import React from 'react';

import styles from './Breadcrumbs.module.scss';

export interface BreadcrumbsProps {
  /** Breadcrumb entries (links, text). The last one is usually the current page. */
  children?: React.ReactNode;
  /** Rendered between entries. Default '/'. */
  separator?: React.ReactNode;
  /** Collapse to an ellipsis when there are more entries than this. Default 8. */
  maxItems?: number;
  itemsBeforeCollapse?: number;
  itemsAfterCollapse?: number;
  className?: string;
  testId?: string;
  /** Accessible name of the navigation landmark. Default 'breadcrumb'. */
  'aria-label'?: string;
}

export const Breadcrumbs = (props: BreadcrumbsProps) => {
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
