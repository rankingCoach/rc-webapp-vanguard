import { isValidElement, ReactNode } from 'react';

import type { TableColumnProps, TableRowProps } from '../Table';

/** The visible text of a rendered node: strings and numbers, and the text inside elements. */
export const nodeText = (node: unknown): string => {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'bigint') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children);
  return '';
};

const isPrimitive = (value: unknown): value is string | number | boolean | bigint =>
  ['string', 'number', 'boolean', 'bigint'].includes(typeof value);

/** A column's header as text (its `text`, rendered if it is a function), else its alias. */
export const columnTitle = (column: TableColumnProps): string => {
  const header = typeof column.text === 'function' ? column.text() : column.text;
  return nodeText(header).trim() || column.alias;
};

/**
 * A cell as text, for search and export: the column's `exportValue`, else a plain value of `row[alias]`, else the
 * column's `sortValue`, else the text inside the rendered cell.
 */
export const cellText = (row: TableRowProps, column: TableColumnProps): string => {
  if (column.exportValue) return nodeText(column.exportValue(row));
  const raw = row[column.alias];
  if (isPrimitive(raw)) return String(raw);
  if (column.sortValue) {
    const sortValue = column.sortValue(row);
    if (isPrimitive(sortValue)) return String(sortValue);
  }
  return nodeText(raw);
};

/** A row's text in one field that is not a column (`toolbar.search.fields`). */
const fieldText = (row: TableRowProps, field: string): string => {
  const value = row[field];
  return isPrimitive(value) ? String(value) : nodeText(value);
};

/** Rows whose searched columns (or `fields`) contain `text`, case-insensitively. Blank text keeps every row. */
export const filterRowsByText = (
  rows: TableRowProps[],
  text: string,
  columns: TableColumnProps[],
  fields?: string[],
): TableRowProps[] => {
  const needle = text.trim().toLocaleLowerCase();
  if (!needle) return rows;
  return rows.filter((row) => {
    const haystack = fields?.length
      ? fields.map((field) => fieldText(row, field))
      : columns.map((column) => cellText(row, column));
    return haystack.some((value) => value.toLocaleLowerCase().includes(needle));
  });
};

/** One CSV field (RFC 4180): quoted when it holds a quote, a separator, a line break or edge whitespace. */
export const csvField = (value: string): string =>
  /[",\r\n]/.test(value) || value !== value.trim() ? `"${value.replace(/"/g, '""')}"` : value;

/** The rows as CSV text: a header line of column titles, then one line per row (CRLF line ends). */
export const rowsToCsv = (rows: TableRowProps[], columns: TableColumnProps[]): string => {
  const lines = [columns.map((column) => csvField(columnTitle(column)))];
  for (const row of rows) {
    lines.push(columns.map((column) => csvField(cellText(row, column))));
  }
  return lines.map((line) => line.join(',')).join('\r\n');
};

/** Saves CSV text as a UTF-8 file with a byte order mark, so spreadsheet apps read accents right. */
export const saveCsvFile = (csv: string, filename: string): void => {
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
