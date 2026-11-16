import { classNames } from '@helpers/classNames';
import { lazyImport } from '@helpers/lazy-import';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Render } from '@vanguard/Render/Render';
import { TablePaginationProps } from '@vanguard/Table/TableFooter/FooterPagination/FooterPagination';
import { TableFooter } from '@vanguard/Table/TableFooter/TableFooter';
import { TableHeader } from '@vanguard/Table/TableHeader/TableHeader';
import { TextReplacements } from '@vanguard/Text/Text';
import React, { createContext, ReactNode, Suspense, useEffect, useMemo, useState } from 'react';

import { TablePlaceholder, TableRowPlaceholder } from './common/TablePlaceholder/TablePlaceholder';
import styles from './Table.module.scss';
import { filterRowsByText, rowsToCsv, saveCsvFile } from './TableToolbar/table-toolbar-data';
import { TableToolbar, TableToolbarOptions } from './TableToolbar/TableToolbar';

const TableBody = lazyImport(() => import('@vanguard/Table/TableBody/TableBody'), 'TableBody');

export type BlurredMessageProps = {
  blurredMessage?: string;
  hideBlurredMessage?: boolean;
  blurredCta?: {
    text: string;
    cta: () => void;
  };
};

export type TableDataProps = {
  options?: TableOptionsProps;
  columns?: Array<TableColumnProps>;
  collections?: Array<TableRowProps>;
  replacements?: TextReplacements;
} & BlurredMessageProps;

export interface TableOptionsPostOrPrefixProps {
  columnAlias: string;
  value: ReactNode | string | ((param: any, row: any) => ReactNode);
  valueParam?: string | number;
  style?: React.CSSProperties;
}

export interface TableOptionsProps {
  postfixForColumn?: Array<TableOptionsPostOrPrefixProps>;
  prefixForColumn?: Array<TableOptionsPostOrPrefixProps>;
}

export type TableSortDirection = 'asc' | 'desc';

export interface TableSort {
  /** Alias of the sorted column. */
  key: string;
  direction: TableSortDirection;
}

export interface TableClientPagination {
  /** Rows per page; the Table slices the (sorted) rows and drives Back/Next itself. */
  pageSize: number;
}

export interface TableColumnProps {
  alias: string;
  /** Header: a string (rendered bold), any ReactNode, or a render function. */
  text: ReactNode | (() => ReactNode);
  /** Header becomes a sort toggle (needs `sort`/`defaultSort` or works uncontrolled from the first click). */
  sortable?: boolean;
  /** Value used for sorting; default `row[alias]`. Numbers compare numerically, everything else as natural text. */
  sortValue?: (row: TableRowProps) => unknown;
  /** The cell as text for the toolbar's search and CSV export; default the plain `row[alias]`, `sortValue`, or the rendered text. */
  exportValue?: (row: TableRowProps) => unknown;
  center?: boolean;
  end?: boolean;
  sticky?: boolean;
  seamShadow?: boolean;
  styles?: object;
}

export type TableRowProps = {
  isBlurred?: boolean;
  postfixForColumn?: Array<TableOptionsPostOrPrefixProps> | null;
  prefixForColumn?: Array<TableOptionsPostOrPrefixProps> | null;
  [key: string]: any;
} & {};

export type TableProps = {
  containerClassName?: string;
  className?: string;
  pagination?: TablePaginationProps;
  data?: TableDataProps;
  onNextPage?: (currentOffset: number) => void;
  onPrevPage?: (currentOffset: number) => void;
  onShowMore?: (currentLimit?: number) => void;
  onShowLess?: (currentLimit?: number) => void;
  isLoading?: boolean;
  hideFooter?: boolean;
  replacements?: TextReplacements;
  hasGreyBody?: boolean;
  /** Controlled sort. */
  sort?: TableSort | null;
  /** Initial sort (uncontrolled). */
  defaultSort?: TableSort | null;
  /** Called with the next sort when a sortable header is clicked (asc first, then flips). */
  onSortChange?: (sort: TableSort) => void;
  /** Client-side paging of `data.collections`; ignores `pagination`/`onNextPage`/`onPrevPage`. */
  clientPagination?: TableClientPagination;
  /** Test id of the container; prefixes the toolbar control ids (`table` when unset). */
  testId?: string;
  /** Optional toolbar: search, CSV download, column picker, title and actions. Off by default. */
  toolbar?: TableToolbarOptions;
} & BlurredMessageProps;

export type TableContextType = {
  sort?: TableSort | null;
  onSortToggle?: (alias: string) => void;
  data?: TableDataProps;
  pagination?: TablePaginationProps;
  onNextPage?: (payload: number) => void;
  onPrevPage?: (payload: number) => void;
  onShowMore?: (payload?: number) => void;
  onShowLess?: (payload?: number) => void;
};
export const TableProvider = createContext<TableContextType>({});

const compareCellValues = (left: unknown, right: unknown): number => {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }
  return String(left ?? '').localeCompare(String(right ?? ''), undefined, { numeric: true });
};

const sortRows = (rows: TableRowProps[], columns: TableColumnProps[], sort?: TableSort | null): TableRowProps[] => {
  if (!sort) return rows;
  const column = columns.find((candidate) => candidate.alias === sort.key);
  const valueOf = (row: TableRowProps) => (column?.sortValue ? column.sortValue(row) : row[sort.key]);
  const direction = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((left, right) => direction * compareCellValues(valueOf(left), valueOf(right)));
};

export const Table = (props: TableProps) => {
  let {
    // eslint-disable-next-line prefer-const
    containerClassName = '',
    // eslint-disable-next-line prefer-const
    className = '',
    pagination = {
      total: 0,
      limit: 0,
      offset: 0,
      page: 0,
      minPage: 0,
      maxPage: 0,
      step: 1,
    },
    // eslint-disable-next-line prefer-const
    data = {
      options: {},
      columns: [],
      collections: [],
    },
    // eslint-disable-next-line prefer-const
    onNextPage = undefined,
    // eslint-disable-next-line prefer-const
    onPrevPage = undefined,
    // eslint-disable-next-line prefer-const
    onShowMore = undefined,
    // eslint-disable-next-line prefer-const
    isLoading = false,
    // eslint-disable-next-line prefer-const
    onShowLess = undefined,

    // eslint-disable-next-line prefer-const
    hideFooter = false,
  } = props;

  const {
    blurredMessage,
    blurredCta,
    replacements,
    hideBlurredMessage,
    hasGreyBody,
    sort: sortProp,
    defaultSort = null,
    onSortChange,
    clientPagination,
    testId,
    toolbar,
  } = props;
  const totalCount = pagination.total;

  // Rendered straight from props (no state copy), so new data shows in the same render.
  const allColumns: Array<TableColumnProps> = data.columns ?? [];

  // Toolbar: column picker (hidden aliases), search text
  const columnPicker = typeof toolbar?.columnPicker === 'object' ? toolbar.columnPicker : undefined;
  const [hiddenColumnsState, setHiddenColumnsState] = useState<string[]>(columnPicker?.defaultHiddenColumns ?? []);
  const hiddenColumns = (toolbar?.columnPicker ? (columnPicker?.hiddenColumns ?? hiddenColumnsState) : []).filter(
    (alias) => allColumns.some((column) => column.alias === alias),
  );
  const columnsData = allColumns.filter((column) => !hiddenColumns.includes(column.alias));
  const onToggleColumn = (alias: string) => {
    const next = hiddenColumns.includes(alias)
      ? hiddenColumns.filter((hidden) => hidden !== alias)
      : [...hiddenColumns, alias];
    if (next.length >= allColumns.length) return; // at least one column stays visible
    if (columnPicker?.hiddenColumns === undefined) setHiddenColumnsState(next);
    columnPicker?.onHiddenColumnsChange?.(next);
  };

  const search = typeof toolbar?.search === 'object' ? toolbar.search : undefined;
  const [searchState, setSearchState] = useState('');
  const searchText = toolbar?.search ? (search?.value ?? searchState) : '';
  const filtersClientSide = !!toolbar?.search && !search?.onChange;
  const optionsData: object = data.options ?? {};

  const [sortState, setSortState] = useState<TableSort | null>(defaultSort);
  const sort = sortProp !== undefined ? sortProp : sortState;
  const onSortToggle = (alias: string) => {
    const next: TableSort =
      sort?.key === alias
        ? { key: alias, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
        : { key: alias, direction: 'asc' };
    if (sortProp === undefined) setSortState(next);
    onSortChange?.(next);
  };
  const filteredRows = useMemo(
    () =>
      filtersClientSide
        ? filterRowsByText(data.collections ?? [], searchText, columnsData, search?.fields)
        : (data.collections ?? []),
    [data.collections, filtersClientSide, searchText, columnsData, search?.fields],
  );
  const sortedRows = useMemo(() => sortRows(filteredRows, allColumns, sort), [filteredRows, allColumns, sort]);

  const [clientOffset, setClientOffset] = useState(0);
  const onSearchTextChange = (text: string) => {
    if (search?.value === undefined) setSearchState(text);
    setClientOffset(0);
    search?.onChange?.(text);
  };
  const onDownload = () => {
    const download = typeof toolbar?.download === 'object' ? toolbar.download : undefined;
    const exportColumns = download?.columns
      ? download.columns
          .map((alias) => allColumns.find((column) => column.alias === alias))
          .filter((column): column is TableColumnProps => !!column)
      : columnsData;
    saveCsvFile(rowsToCsv(sortedRows, exportColumns), download?.filename ?? 'table.csv');
  };
  const pageSize = clientPagination?.pageSize ?? 0;
  const clientLastOffset = pageSize > 0 ? Math.max(0, Math.ceil(sortedRows.length / pageSize) - 1) * pageSize : 0;
  const effectiveClientOffset = Math.min(clientOffset, clientLastOffset);
  const rowsData =
    pageSize > 0 ? sortedRows.slice(effectiveClientOffset, effectiveClientOffset + pageSize) : sortedRows;
  const clientPaginationData: TablePaginationProps | undefined =
    pageSize > 0
      ? {
          total: sortedRows.length,
          limit: pageSize,
          offset: effectiveClientOffset,
          page: effectiveClientOffset / pageSize + 1,
          minPage: 1,
          maxPage: Math.max(1, Math.ceil(sortedRows.length / pageSize)),
          step: 1,
        }
      : undefined;

  const [total, setTotal] = useState<number>(pagination.total);
  const [offset, setOffset] = useState<number>(pagination.offset);
  const [limit, setLimit] = useState<number>(pagination.limit);
  const [page, setPage] = useState<number>(pagination.page);
  const [paginationData, setPaginationData] = useState<TablePaginationProps>(pagination);

  useEffect(() => {
    if (hideFooter) {
      setLimit(0);
      setOffset(0);
      setPage(1);
    }
  }, [hideFooter]);

  useEffect(() => {
    if (limit > 0) {
      //console.log('something changed... data, pagination, limit or offset');
      const newPage = (offset + limit) / limit;
      pagination = {
        total: pagination.total ?? 0,
        limit: pagination.limit,
        offset: pagination.offset,
        minPage: pagination.minPage,
        maxPage: pagination.maxPage,
        step: pagination.step,
        page: newPage,
      };
      pagination && setPaginationData(pagination);
      totalCount && setTotal(totalCount);
      newPage && setPage(newPage);
    }
  }, [data]);

  const context: TableContextType = {
    data: {
      options: { ...optionsData },
      columns: [...columnsData],
      collections: [...rowsData],
      blurredMessage: blurredMessage,
      hideBlurredMessage: hideBlurredMessage,
      blurredCta: blurredCta,
      replacements: replacements,
    },

    pagination: clientPaginationData ?? paginationData,
    onNextPage: clientPaginationData ? () => setClientOffset(effectiveClientOffset + pageSize) : onNextPage,
    onPrevPage: clientPaginationData
      ? () => setClientOffset(Math.max(0, effectiveClientOffset - pageSize))
      : onPrevPage,
    onShowMore,
    onShowLess,
    sort,
    onSortToggle,
  };

  const toolbarView = toolbar ? (
    <TableToolbar
      testId={testId ?? 'table'}
      options={toolbar}
      searchText={searchText}
      onSearchTextChange={onSearchTextChange}
      columns={allColumns}
      hiddenColumns={hiddenColumns}
      onToggleColumn={onToggleColumn}
      onDownload={onDownload}
    />
  ) : null;

  if (isLoading) {
    return toolbarView ? (
      <>
        {toolbarView}
        <TablePlaceholder />
      </>
    ) : (
      <TablePlaceholder />
    );
  }

  /*
  console.log("Limit:", limit);
  console.log("Offset:", offset);
  console.log("Page:", page);
  */

  return (
    <TableProvider.Provider value={{ ...context }}>
      {toolbarView}
      <ComponentContainer className={classNames(styles.container, containerClassName)} testId={testId}>
        <table className={classNames(styles.table, className)}>
          <Render if={columnsData.length > 0}>
            <TableHeader
              order={columnsData[0]?.alias}
              className={classNames(styles.tableHead)}
              hasGreyTheme={hasGreyBody}
            />
            <Suspense
              fallback={
                <tbody>
                  <tr>
                    <td>
                      <TableRowPlaceholder />
                    </td>
                  </tr>
                </tbody>
              }
            >
              <TableBody hasGreyBody={hasGreyBody} />
            </Suspense>
            <Render if={!hideFooter}>
              <TableFooter />
            </Render>
          </Render>
        </table>
      </ComponentContainer>
    </TableProvider.Provider>
  );
};
