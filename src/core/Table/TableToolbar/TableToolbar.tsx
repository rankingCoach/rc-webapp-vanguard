import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { CheckBox } from '@vanguard/CheckBox/CheckBox';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Input } from '@vanguard/Input/Input';
import { Menu } from '@vanguard/Menu/Menu';
import { MenuItem } from '@vanguard/MenuItem/MenuItem';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React, { ReactNode, useState } from 'react';

import type { TableColumnProps } from '../Table';
import { columnTitle } from './table-toolbar-data';
import styles from './TableToolbar.module.scss';

/** `toolbar.search`: a text filter over the rows. */
export type TableToolbarSearch = {
  placeholder?: string;
  /** Row keys to search instead of the visible columns. */
  fields?: string[];
  /** Controlled search text. */
  value?: string;
  /**
   * With it, the caller owns the search (e.g. server-side paging): the Table reports the text and filters nothing
   * itself. Without it, the Table filters `data.collections` client side.
   */
  onChange?: (text: string) => void;
};

/** `toolbar.download`: a CSV export of the filtered, sorted rows (every page the Table holds, not just the shown one). */
export type TableToolbarDownload = {
  /** File name; `.csv` is appended when missing. Default `table.csv`. */
  filename?: string;
  /** Column aliases to export, in this order. Default: the visible columns. */
  columns?: string[];
};

/** `toolbar.columnPicker`: a menu of checkboxes that shows and hides columns (at least one stays visible). */
export type TableToolbarColumnPicker = {
  /** Controlled hidden column aliases. */
  hiddenColumns?: string[];
  /** Initially hidden column aliases (uncontrolled). */
  defaultHiddenColumns?: string[];
  onHiddenColumnsChange?: (hiddenColumns: string[]) => void;
};

/**
 * The Table's optional toolbar (off by default). `true` turns a control on with its defaults. The control test ids are
 * `${testId}-toolbar-search`, `${testId}-toolbar-download` and `${testId}-toolbar-columns`.
 */
export type TableToolbarOptions = {
  search?: boolean | TableToolbarSearch;
  download?: boolean | TableToolbarDownload;
  columnPicker?: boolean | TableToolbarColumnPicker;
  /** Left of the controls; a string renders as a bold heading. */
  title?: ReactNode;
  /** The caller's own controls, before the toolbar's. */
  actions?: ReactNode;
};

export type TableToolbarProps = {
  testId: string;
  options: TableToolbarOptions;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  /** Every column, hidden ones included. */
  columns: TableColumnProps[];
  hiddenColumns: string[];
  onToggleColumn: (alias: string) => void;
  onDownload: () => void;
};

const searchOptions = (options: TableToolbarOptions): TableToolbarSearch =>
  typeof options.search === 'object' ? options.search : {};

export const TableToolbar = (props: TableToolbarProps) => {
  const { testId, options, searchText, onSearchTextChange, columns, hiddenColumns, onToggleColumn, onDownload } = props;
  const [columnsAnchor, setColumnsAnchor] = useState<HTMLElement | null>(null);
  const visibleCount = columns.length - hiddenColumns.length;

  return (
    <div className={styles.toolbar} data-testid={`${testId}-toolbar`}>
      <div className={styles.title}>
        {typeof options.title === 'string' ? (
          <Text type={TextTypes.heading4} fontWeight={FontWeights.bold}>
            {options.title}
          </Text>
        ) : (
          options.title
        )}
      </div>

      <div className={styles.controls}>
        {options.actions}

        {options.search ? (
          <Input
            className={styles.search}
            testId={`${testId}-toolbar-search`}
            label={'Search'}
            labelType={'hidden'}
            placeholder={searchOptions(options).placeholder ?? 'Search'}
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            adornment={
              <Icon type={IconSize.small} color={'--n500'}>
                {IconNames.search}
              </Icon>
            }
          />
        ) : null}

        {options.download ? (
          <Button
            testId={`${testId}-toolbar-download`}
            type={ButtonTypes.muted}
            size={ButtonSizes.medium}
            iconLeft={IconNames.download}
            onClick={onDownload}
          >
            {'Download CSV'}
          </Button>
        ) : null}

        {options.columnPicker ? (
          <>
            <Button
              testId={`${testId}-toolbar-columns`}
              type={ButtonTypes.muted}
              size={ButtonSizes.medium}
              iconLeft={IconNames.list}
              ariaLabel={'Show or hide columns'}
              onClick={(event: React.MouseEvent) => setColumnsAnchor(event.currentTarget as HTMLElement)}
            >
              {'Columns'}
            </Button>
            <Menu
              testId={`${testId}-toolbar-columns-menu`}
              anchorEl={columnsAnchor}
              open={columnsAnchor !== null}
              onClose={() => setColumnsAnchor(null)}
            >
              {columns.map((column) => {
                const visible = !hiddenColumns.includes(column.alias);
                const isLastVisible = visible && visibleCount <= 1;
                return (
                  <MenuItem
                    key={column.alias}
                    className={styles.columnItem}
                    testId={`${testId}-toolbar-columns-${column.alias}`}
                    role={'menuitemcheckbox'}
                    aria-checked={visible}
                    disabled={isLastVisible}
                    onClick={() => onToggleColumn(column.alias)}
                  >
                    <CheckBox
                      className={styles.columnCheckBox}
                      checked={visible}
                      label={columnTitle(column)}
                      translate={false}
                    />
                  </MenuItem>
                );
              })}
            </Menu>
          </>
        ) : null}
      </div>
    </div>
  );
};
