// Ported from @mui/material@9.5.0 Pagination/Pagination.js, usePagination/usePagination.js, PaginationItem/PaginationItem.js, internal/svg-icons/{FirstPage,LastPage,NavigateBefore,NavigateNext}.js (MIT)

import styles from './Pagination.module.scss';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { ButtonBase } from '../../primitives/react/ButtonBase/ButtonBase';
// Own-core MUI markup: internal `cx` (clsx semantics, as MUI emits), not the public classNames helper (track h).
import { cx } from '../../primitives/react/class-names';
import { useVanguardTypography } from '../../primitives/react/typography-context';

export interface PaginationProps {
  /** Number of pages. */
  count: number;
  /** Current page, 1-based (controlled). */
  page?: number;
  /** Initial page, 1-based (uncontrolled). Default 1. */
  defaultPage?: number;
  /** Called with the new 1-based page. */
  onChange?: (event: React.ChangeEvent<unknown>, page: number) => void;
  /** Default 'circular'. */
  shape?: 'circular' | 'rounded';
  /** Default 'medium'. */
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  /** Pages shown on each side of the current page. Default 1. */
  siblingCount?: number;
  /** Pages always shown at the start and end. Default 1. */
  boundaryCount?: number;
  showFirstButton?: boolean;
  showLastButton?: boolean;
  hidePrevButton?: boolean;
  hideNextButton?: boolean;
  className?: string;
  testId?: string;
}

type ItemType = 'page' | 'first' | 'last' | 'previous' | 'next' | 'start-ellipsis' | 'end-ellipsis';
interface Item {
  type: ItemType;
  page: number | null;
  selected: boolean;
  disabled: boolean;
  onClick: (event: React.MouseEvent) => void;
}

/** MUI's internal navigation icons (svg-icons/*.js). */
const ICONS: Partial<Record<ItemType, { testId: string; d: string }>> = {
  first: { testId: 'FirstPageIcon', d: 'M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z' },
  last: { testId: 'LastPageIcon', d: 'M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z' },
  previous: { testId: 'NavigateBeforeIcon', d: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' },
  next: { testId: 'NavigateNextIcon', d: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z' },
};
const TYPE_CLASS: Record<ItemType, string> = {
  page: 'page',
  first: 'firstLast',
  last: 'firstLast',
  'start-ellipsis': 'ellipsis',
  'end-ellipsis': 'ellipsis',
  previous: 'previousNext',
  next: 'previousNext',
};
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => start + i);
const ariaLabel = (type: ItemType, page: number | null, selected: boolean) =>
  type === 'page' ? `${selected ? '' : 'Go to '}page ${page}` : `Go to ${type} page`;

/**
 * Renders MUI 9.5 Pagination's DOM itself (variant text, color standard): `nav` > `ul` > `li` per item; pages and
 * first/previous/next/last are A's ButtonBase (native button), ellipses plain divs; MUI's usePagination item model,
 * aria labels, aria-current and the focus hand-over when a first/previous/next/last button becomes disabled. Emotion's
 * rules are static in _Pagination.compat.scss (D15 last block); `vg-typography-vanguard` selects VanguardThemeProvider's
 * rem sizes.
 */
export const Pagination = (props: PaginationProps) => {
  const {
    count = 1,
    page: pageProp,
    defaultPage = 1,
    onChange,
    shape = 'circular',
    size = 'medium',
    disabled = false,
    siblingCount = 1,
    boundaryCount = 1,
    showFirstButton = false,
    showLastButton = false,
    hidePrevButton = false,
    hideNextButton = false,
    className,
    testId = 'pagination',
  } = props;
  const vgType = useVanguardTypography() === 'vanguard' ? 'vg-typography-vanguard' : undefined;
  const [innerPage, setInnerPage] = useState(defaultPage);
  const page = pageProp !== undefined ? pageProp : innerPage;
  const navRef = useRef<HTMLElement>(null);
  const pendingFocus = useRef<{ page: number | null; trigger: Element } | null>(null);

  // usePagination
  const handleClick = (event: React.MouseEvent, value: number | null) => {
    if (!pageProp) setInnerPage(value as number);
    onChange?.(event as unknown as React.ChangeEvent<unknown>, value as number);
  };
  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);
  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    count - boundaryCount - 1,
  );
  const itemList: Array<number | ItemType> = [
    ...(showFirstButton ? (['first'] as const) : []),
    ...(hidePrevButton ? [] : (['previous'] as const)),
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? (['start-ellipsis'] as const)
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? (['end-ellipsis'] as const)
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),
    ...endPages,
    ...(hideNextButton ? [] : (['next'] as const)),
    ...(showLastButton ? (['last'] as const) : []),
  ];
  const buttonPage = (type: ItemType) =>
    type === 'first' ? 1 : type === 'previous' ? page - 1 : type === 'next' ? page + 1 : type === 'last' ? count : null;
  const items: Item[] = itemList.map((item) =>
    typeof item === 'number'
      ? { type: 'page', page: item, selected: item === page, disabled, onClick: (e) => handleClick(e, item) }
      : {
          type: item,
          page: buttonPage(item),
          selected: false,
          disabled:
            disabled ||
            (!item.includes('ellipsis') && (item === 'next' || item === 'last' ? page >= count : page <= 1)),
          onClick: (e) => handleClick(e, buttonPage(item)),
        },
  );

  // Pagination: keep keyboard focus when the activated first/previous/next/last button becomes disabled.
  const selectedPage = items.find((i) => i.selected)?.page;
  const handleItemClick = (item: Item, event: React.MouseEvent) => {
    pendingFocus.current = null;
    const willBecomeDisabled =
      ((item.type === 'first' || item.type === 'previous') && item.page === 1) ||
      ((item.type === 'next' || item.type === 'last') && item.page === count);
    if (willBecomeDisabled && event.currentTarget.ownerDocument.activeElement === event.currentTarget)
      pendingFocus.current = { page: item.page, trigger: event.currentTarget };
    item.onClick(event);
  };
  useLayoutEffect(() => {
    const pending = pendingFocus.current;
    if (!pending || pending.page !== selectedPage) return;
    const doc = navRef.current?.ownerDocument ?? document;
    const active = doc.activeElement;
    if (active === doc.body || active === doc.documentElement || active === pending.trigger || active == null)
      navRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
    pendingFocus.current = null;
  }, [selectedPage]);

  const itemClasses = (item: Item) => [
    'MuiPaginationItem-root',
    `MuiPaginationItem-size${capitalize(size)}`,
    'MuiPaginationItem-text',
    `MuiPaginationItem-${shape}`,
    item.disabled && 'Mui-disabled',
    item.selected && 'Mui-selected',
    `MuiPaginationItem-${TYPE_CLASS[item.type]}`,
  ];

  return (
    <nav
      data-vg-core=""
      data-slot={'pagination'}
      data-size={size}
      data-shape={shape}
      data-disabled={disabled ? '' : undefined}
      aria-label="pagination navigation"
      className={cx(
        'MuiPagination-root MuiPagination-text',
        styles.pagination,
        'vanguard-pagination',
        className,
        vgType,
      )}
      ref={navRef}
      data-testid={testId}
    >
      <ul data-vg-core="" data-slot={'pagination-list'} className={'MuiPagination-ul'}>
        {items.map((item, index) => {
          const label = ariaLabel(item.type, item.page, item.selected);
          if (item.type === 'start-ellipsis' || item.type === 'end-ellipsis')
            return (
              <li key={index}>
                <div data-vg-core="" data-slot={'pagination-ellipsis'} className={cx(...itemClasses(item))}>
                  …
                </div>
              </li>
            );
          const icon = ICONS[item.type];
          return (
            <li key={index}>
              <ButtonBase
                data-vg-core=""
                data-slot={'pagination-item'}
                data-selected={item.selected ? '' : undefined}
                className={cx(...itemClasses(item))}
                disabled={item.disabled}
                aria-current={item.selected ? 'page' : undefined}
                aria-label={label}
                onClick={(event) => handleItemClick(item, event as React.MouseEvent)}
              >
                {item.type === 'page' && item.page}
                {icon ? (
                  <svg
                    data-vg-core=""
                    className={'MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiPaginationItem-icon'}
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    data-testid={icon.testId}
                  >
                    <path d={icon.d} />
                  </svg>
                ) : null}
              </ButtonBase>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
