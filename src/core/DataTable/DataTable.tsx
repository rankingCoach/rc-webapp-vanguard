import { classNames } from '@helpers/classNames';
import React, { createContext, useContext } from 'react';

import styles from './DataTable.module.scss';

type Section = 'head' | 'body' | 'foot';
const SectionContext = createContext<Section>('body');

export interface DataTableProps {
  children?: React.ReactNode;
  /** 'small' = compact rows (admin stats). Default 'medium'. */
  size?: 'small' | 'medium';
  /** Header row stays visible while the wrapper scrolls vertically (give the table a `maxHeight`). */
  stickyHeader?: boolean;
  /** First column stays visible while the wrapper scrolls horizontally. */
  stickyFirstColumn?: boolean;
  /** Max height of the scroll wrapper, e.g. '480px'. Needed for a sticky header to have something to stick in. */
  maxHeight?: string;
  /** Minimum table width (the wrapper scrolls horizontally below it), e.g. '720px'. */
  minWidth?: string;
  className?: string;
  /** Class of the scroll wrapper around the table. */
  containerClassName?: string;
  testId?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Plain semantic data table for dense stats/key-value views. Compose it like an HTML table:
 * DataTable > DataTableHead|DataTableBody > DataTableRow > DataTableCell. Cells in DataTableHead render
 * as `<th scope="col">`; a body cell with `header` renders as `<th scope="row">`. Tables nest inside cells.
 */
export const DataTable = (props: DataTableProps) => {
  const {
    children,
    size = 'medium',
    stickyHeader = false,
    stickyFirstColumn = false,
    maxHeight,
    minWidth,
    className,
    containerClassName,
    testId = 'data-table',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  } = props;
  return (
    <div
      className={classNames(styles.container, 'vanguard-data-table-container', containerClassName)}
      style={maxHeight ? { maxHeight } : undefined}
      data-testid={`${testId}-container`}
    >
      <table
        className={classNames(
          styles.table,
          size === 'small' ? styles.small : undefined,
          stickyHeader ? styles.stickyHeader : undefined,
          stickyFirstColumn ? styles.stickyFirstColumn : undefined,
          'vanguard-data-table',
          className,
        )}
        style={minWidth ? { minWidth } : undefined}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {children}
      </table>
    </div>
  );
};

export interface DataTableSectionProps {
  children?: React.ReactNode;
  className?: string;
}

export const DataTableHead = ({ children, className }: DataTableSectionProps) => (
  <SectionContext.Provider value={'head'}>
    <thead className={classNames(styles.head, className)}>{children}</thead>
  </SectionContext.Provider>
);

export const DataTableBody = ({ children, className }: DataTableSectionProps) => (
  <SectionContext.Provider value={'body'}>
    <tbody className={className}>{children}</tbody>
  </SectionContext.Provider>
);

export const DataTableFoot = ({ children, className }: DataTableSectionProps) => (
  <SectionContext.Provider value={'foot'}>
    <tfoot className={classNames(styles.foot, className)}>{children}</tfoot>
  </SectionContext.Provider>
);

export interface DataTableRowProps {
  children?: React.ReactNode;
  /** Highlight the row on hover (body rows). */
  hover?: boolean;
  selected?: boolean;
  onClick?: (event: React.MouseEvent<HTMLTableRowElement>) => void;
  className?: string;
  testId?: string;
}

export const DataTableRow = (props: DataTableRowProps) => {
  const { children, hover = false, selected = false, onClick, className, testId } = props;
  return (
    <tr
      className={classNames(
        hover ? styles.hover : undefined,
        selected ? styles.selected : undefined,
        onClick ? styles.clickable : undefined,
        className,
      )}
      aria-selected={selected || undefined}
      onClick={onClick}
      data-testid={testId}
    >
      {children}
    </tr>
  );
};

export interface DataTableCellProps {
  children?: React.ReactNode;
  /** Render a header cell (`th`). Automatic inside DataTableHead; use it for row labels in the body. */
  header?: boolean;
  /** Default: 'col' in DataTableHead, 'row' for a body `header` cell. */
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
  /** Right-aligned tabular numbers. */
  numeric?: boolean;
  align?: 'left' | 'center' | 'right';
  colSpan?: number;
  rowSpan?: number;
  /** Shade the cell like a header (key column of a key/value table). */
  muted?: boolean;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  testId?: string;
}

export const DataTableCell = (props: DataTableCellProps) => {
  const section = useContext(SectionContext);
  const { children, header, scope, numeric = false, align, colSpan, rowSpan, muted = false, className, style, title, testId } =
    props;
  const isHeader = header ?? section === 'head';
  const Tag = isHeader ? 'th' : 'td';
  const resolvedScope = isHeader ? (scope ?? (section === 'head' ? 'col' : 'row')) : scope;
  return (
    <Tag
      scope={resolvedScope}
      colSpan={colSpan}
      rowSpan={rowSpan}
      title={title}
      data-testid={testId}
      className={classNames(
        styles.cell,
        isHeader ? styles.headerCell : undefined,
        numeric ? styles.numeric : undefined,
        align ? styles[`align-${align}`] : undefined,
        muted ? styles.muted : undefined,
        className,
      )}
      style={style}
    >
      {children}
    </Tag>
  );
};
