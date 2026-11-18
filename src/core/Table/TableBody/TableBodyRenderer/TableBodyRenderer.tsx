import { TableColumnProps, TableOptionsProps, TableRowProps } from '@vanguard/Table/Table';
import { TableCell } from '@vanguard/Table/TableCell/TableCell';
import React from 'react';

import styles from './TableBodyRenderer.module.scss';

export interface TableBodyRendererProps {
  rows?: Array<TableRowProps>;
  columns?: Array<TableColumnProps>;
  options?: TableOptionsProps;
  hideBlurred?: boolean;
  hasGreyBody?: boolean;
}

export const TableBodyRenderer = (props: TableBodyRendererProps) => {
  const { rows = [], columns = [], options = {}, hideBlurred, hasGreyBody } = props;
  return (
    <tbody data-slot={'table-body'} className={styles.tableBody}>
      {rows.map((row, i) => {
        const hideRow = row.isBlurred && hideBlurred;
        if (hideRow) {
          return null;
        }
        return (
          <tr data-slot={'table-row'} key={i}>
            {columns?.map((column, j) => {
              return (
                <TableCell
                  isBlurred={row.isBlurred}
                  key={`${i}${j}`}
                  row={row}
                  column={column}
                  options={options}
                  rowIndex={i}
                  colIndex={j}
                  hasGreyBody={hasGreyBody}
                />
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
};
