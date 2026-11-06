import { alignItemsCenter, dFlex } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import {
  TableColumnProps,
  TableOptionsPostOrPrefixProps,
  TableOptionsProps,
  TableRowProps,
} from '@vanguard/Table/Table';
import React from 'react';

import { Text, TextTypes } from '../../Text/Text';
import styles from './TableCell.module.scss';

const ObjectCellRender = (cellOption: TableOptionsPostOrPrefixProps) => <>{cellOption.value}</>;


export interface TableCellProps {
  row?: any;
  column?: TableColumnProps;
  options?: TableOptionsProps;
  rowIndex?: number;
  colIndex?: number;
  isBlurred?: boolean;
  hasGreyBody?: boolean;
}

export interface TableCellContentProps {
  options?: TableOptionsProps;
  row?: TableRowProps;
  column?: TableColumnProps;
  type: 'prefix' | 'postfix';
}

export const TableCellContent = (props: TableCellContentProps) => {
  const { row = {}, column, type } = props;
  let { options } = props;
  // Lose the reference
  if (row && options) {
    options = { ...options };
    /**
     *Allow override from columns settings table settings
     * */
    options.postfixForColumn =
      row.postfixForColumn !== undefined ? (row.postfixForColumn ?? undefined) : options.postfixForColumn;
    options.prefixForColumn =
      row.prefixForColumn !== undefined ? (row.prefixForColumn ?? undefined) : options.prefixForColumn;
  }
  //@ts-ignore
  const cellContentTypeOption = options ? ([`${type}ForColumn`] ? options[`${type}ForColumn`] : []) : null;
  const cellOption: TableOptionsPostOrPrefixProps = cellContentTypeOption
    ? cellContentTypeOption.filter((option: TableOptionsPostOrPrefixProps) => {
        if (option.columnAlias == column?.alias) return option;
        return false;
      })[0]
    : null;

  let ObjectCmp = null;
  if (cellOption?.value && typeof cellOption?.value === 'object') {
    ObjectCmp = ObjectCellRender.bind(null, cellOption);
  }

  return cellOption && cellOption.value && cellOption.columnAlias == column?.alias ? (
    <div style={cellOption.style ?? undefined} className={`optional-${type}`}>
      {typeof cellOption.value === 'function' && cellOption.valueParam && row[cellOption.valueParam] ? (
        cellOption.value(row[cellOption.valueParam], row)
      ) : ObjectCmp ? (
        <ObjectCmp />
      ) : null}
    </div>
  ) : null;
};

export const TableCell = (props: TableCellProps) => {
  const { row, column, options, rowIndex, colIndex, isBlurred, hasGreyBody } = props;
  return (
    <td
      key={`${rowIndex}-${colIndex}`}
      className={classNames(
        styles.tableCell,
        hasGreyBody ? styles.tableGreyBody : undefined,
        column?.sticky ? styles.tableSticky : undefined,
        column?.seamShadow ? styles.tableSeamShadow : undefined,
      )}
      style={column?.styles ? { ...column.styles } : undefined}
    >
      <div
        className={classNames(
          dFlex,
          alignItemsCenter,
          column?.center ? styles.tableCentered : undefined,
          column?.end ? styles.tableEnd : undefined,
        )}
      >
        <TableCellContent {...props} type={'prefix'} />
        {column?.alias ? (
          typeof row[column.alias] === 'object' ? (
            row[column.alias]
          ) : (
            <Text type={TextTypes.textHelp} isBlurred={isBlurred} translate={false} className={styles.value}>
              {row[column.alias]}
            </Text>
          )
        ) : null}
        <TableCellContent {...props} type={'postfix'} />
      </div>
    </td>
  );
};
