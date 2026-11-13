import { classNames } from '@helpers/classNames';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { TableColumnProps, TableContextType, TableProvider } from '@vanguard/Table/Table';
import React, { Context, ReactNode, useContext } from 'react';

import { FontWeights, Text, TextTypes } from '../../Text/Text';
import styles from './TableHeader.module.scss';

export interface TableHeaderProps {
  order?: string | undefined;
  children?: ReactNode | undefined;
  className?: string | undefined;
  provider?: Context<TableContextType>;
  hasGreyTheme?: boolean;
}

const renderHeaderText = (text: TableColumnProps['text']): ReactNode => {
  if (typeof text === 'function') return text();
  if (typeof text === 'string') {
    return (
      <Text type={TextTypes.text} fontWeight={FontWeights.bold}>
        {text}
      </Text>
    );
  }
  return text;
};

export const TableHeader = (props: TableHeaderProps) => {
  const { children, order = undefined, className = undefined, provider = TableProvider, hasGreyTheme } = props;

  const context = useContext<TableContextType>(provider);
  const { data, sort, onSortToggle } = context;
  const columns = data?.columns ?? [];
  const options = data?.options ?? {};
  const columnsCount = columns?.length;

  return (
    <thead className={classNames('vanguard-table-head', 'table-head', className, styles.tableHead)}>
      <tr>
        {columns?.length
          ? columns.map((item: any, i: number) => {
              const orderClass = ''; //order && order === item.alias ? styles.columnSortDesc : styles.columnSortAsc;
              const centerClass = item.center && item.center === true ? styles.tableCentered : '';
              const endClass = item.end && item.end === true ? styles.tableEnd : '';
              const stickyClass = item.sticky && item.sticky === true ? styles.tableSticky : '';
              const seamShadowClass = item.seamShadow ? styles.tableSeamShadow : '';
              const greyClass = hasGreyTheme ? styles.greyTheme : '';
              const cssClasses = [orderClass];
              const isSortable = !!item.sortable && !!onSortToggle;
              const sortDirection = sort?.key === item.alias ? sort.direction : undefined;
              const ariaSort = isSortable ? (sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none') : undefined;
              return (
                <th
                  key={i}
                  scope={'col'}
                  aria-sort={ariaSort}
                  className={classNames(
                    'vanguard-table-cell',
                    'table-cell',
                    styles.tableCell,
                    stickyClass,
                    seamShadowClass,
                    greyClass,
                    cssClasses.join(', '),
                  )}
                  style={item?.styles ? { ...item.styles } : undefined}
                >
                  <div className={classNames(centerClass, endClass)}>
                    {isSortable ? (
                      <button
                        type={'button'}
                        className={classNames('vanguard-table-sort-button', styles.sortButton)}
                        data-testid={`table-sort-${item.alias}`}
                        onClick={() => onSortToggle?.(item.alias)}
                      >
                        {renderHeaderText(item.text)}
                        <span className={styles.sortIcon} aria-hidden={true}>
                          {sortDirection ? (
                            <Icon type={IconSize.small}>
                              {sortDirection === 'asc' ? IconNames.arrowUp : IconNames.arrowDown}
                            </Icon>
                          ) : null}
                        </span>
                      </button>
                    ) : (
                      renderHeaderText(item.text)
                    )}
                  </div>
                </th>
              );
            })
          : null}
      </tr>
    </thead>
  );
};

TableHeader.styles = styles;
