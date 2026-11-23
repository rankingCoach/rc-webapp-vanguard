// Ported from @mui/material@9.5.0 Breadcrumbs/Breadcrumbs.js, Breadcrumbs/BreadcrumbCollapsed.js, internal/svg-icons/MoreHoriz.js (MIT)

import styles from './Breadcrumbs.module.scss';
import React, { useRef, useState } from 'react';
import { ButtonBase } from '../../primitives/react/ButtonBase/ButtonBase';
// Own-core MUI markup: internal `cx` (clsx semantics, as MUI emits), not the public classNames helper (track h).
import { cx } from '../../primitives/react/class-names';
import { useVanguardTypography } from '../../primitives/react/typography-context';

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

/** MUI's internal MoreHoriz icon path (svg-icons/MoreHoriz.js). */
const MORE_HORIZ_PATH =
  'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z';

/**
 * Renders MUI 9.5 Breadcrumbs' DOM itself (Typography body1 `nav` > `ol` of `li` entries with aria-hidden separators;
 * past `maxItems` the middle collapses into an ellipsis button that expands the list and focuses its first focusable
 * entry). Emotion's rules are static in _Breadcrumbs.compat.scss (D15 last block); `vg-typography-vanguard` selects
 * VanguardThemeProvider's rem sizes.
 */
export const Breadcrumbs = (props: BreadcrumbsProps) => {
  const {
    children,
    separator = '/',
    maxItems = 8,
    itemsBeforeCollapse = 1,
    itemsAfterCollapse = 1,
    className,
    testId = 'breadcrumbs',
    'aria-label': ariaLabel = 'breadcrumb',
  } = props;
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const vgType = useVanguardTypography() === 'vanguard' ? 'vg-typography-vanguard' : undefined;

  const allItems = React.Children.toArray(children)
    .filter((child) => React.isValidElement(child))
    .map((child, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: positional key, parity with @mui/material 9.5.0 Breadcrumbs (`child-${index}`); a semantic key changes focus on insert (BC1)
      <li data-vg-core="" data-slot={'breadcrumbs-item'} className={'MuiBreadcrumbs-li'} key={`child-${index}`}>
        {child}
      </li>
    ));

  const renderItemsBeforeAndAfter = (items: React.ReactElement[]) => {
    const handleClickExpand = () => {
      setExpanded(true);
      const focusable = listRef.current?.querySelector<HTMLElement>('a[href],button,[tabindex]');
      if (focusable) focusable.focus();
    };
    // MUI: an invalid combination (before + after >= all) shows everything.
    if (itemsBeforeCollapse + itemsAfterCollapse >= items.length) return items;
    return [
      ...items.slice(0, itemsBeforeCollapse),
      <li data-vg-core="" data-slot={'breadcrumbs-collapsed'} key="ellipsis">
        <ButtonBase
          data-vg-core=""
          data-slot={'breadcrumbs-expand'}
          focusRipple
          aria-label={'Show path'}
          onClick={handleClickExpand}
        >
          <svg
            data-vg-core=""
            className={'MuiSvgIcon-root MuiSvgIcon-fontSizeMedium'}
            focusable="false"
            aria-hidden="true"
            viewBox="0 0 24 24"
            data-testid="MoreHorizIcon"
          >
            <path d={MORE_HORIZ_PATH} />
          </svg>
        </ButtonBase>
      </li>,
      ...items.slice(items.length - itemsAfterCollapse, items.length),
    ];
  };

  const shown = expanded || (maxItems && allItems.length <= maxItems) ? allItems : renderItemsBeforeAndAfter(allItems);
  const withSeparators = shown.reduce<React.ReactNode[]>((acc, current, index) => {
    acc.push(current);
    if (index < shown.length - 1)
      acc.push(
        <li
          data-vg-core=""
          data-slot={'breadcrumbs-separator'}
          aria-hidden={true}
          className={'MuiBreadcrumbs-separator'}
          // biome-ignore lint/suspicious/noArrayIndexKey: positional key, parity with @mui/material 9.5.0 Breadcrumbs (`separator-${index}`); aria-hidden separator, no item identity
          key={`separator-${index}`}
        >
          {separator}
        </li>,
      );
    return acc;
  }, []);

  return (
    <nav
      data-vg-core=""
      data-slot={'breadcrumbs'}
      data-expanded={expanded ? '' : undefined}
      className={cx(
        'MuiTypography-root MuiTypography-body1 MuiBreadcrumbs-root',
        styles.breadcrumbs,
        'vanguard-breadcrumbs',
        className,
        vgType,
      )}
      aria-label={ariaLabel}
      data-testid={testId}
    >
      <ol data-vg-core="" data-slot={'breadcrumbs-list'} className={'MuiBreadcrumbs-ol'} ref={listRef}>
        {withSeparators}
      </ol>
    </nav>
  );
};
