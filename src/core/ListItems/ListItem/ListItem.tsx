import { classNames } from '@helpers/classNames';
import { Render } from '@vanguard/Render/Render';
import React, { ReactNode, useEffect, useRef } from 'react';

import styles from './ListItem.module.scss';

export type StickyItemStyles = {
  normal?: string;
  stuckBottom?: string;
  stuckTop?: string;
};

export type StickyType = 'top' | 'bottom' | 'none';

export interface ListItemPropsBase<T> {
  item: ListItemType<T>;
  hideLeft?: boolean;
  hideRight?: boolean;
  scrollIntoView?: boolean;
  isSticky?: boolean;
  stickyType?: StickyType;
  stickyItemStyles?: StickyItemStyles;
  hoverable?: boolean;
  onHover?: (hoverEl: T, hoverIdx: number, isHovered: boolean) => void;
  idx?: number;
  hasSidebarPositionCircle?: boolean;
}

export interface ListItemType<T> {
  id?: string;
  isSticky?: boolean;
  scrollIntoView?: boolean;
  highlighted?: boolean;
  left?: ReactNode | string | undefined;
  title?: ReactNode | string | undefined;
  content?: ReactNode | string | undefined;
  last?: ReactNode | string | undefined;
  right?: ReactNode | string | undefined;
  element?: T;
}

interface ListItemPropsWIthCLick<T> extends ListItemPropsBase<T> {
  onClick?: (el: T, index: number) => void;
  element?: T;
}

export type ListItemProps<T> = ListItemPropsBase<T> & ListItemPropsWIthCLick<T>;

export const ListItem = <ObjectType,>(props: ListItemProps<ObjectType>) => {
  const {
    item,
    hideLeft = false,
    hideRight = false,
    onClick,
    scrollIntoView,
    isSticky,
    stickyItemStyles,
    stickyType,
    hoverable,
    onHover,
    idx,
  } = props;

  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (ref.current && scrollIntoView) {
      ref?.current?.scrollIntoView({
        behavior: 'smooth',
        //center block does not work with sticky elements so we set it to nearest
        block: isSticky ? 'nearest' : 'center',
        inline: 'center',
      });
    }
  }, [scrollIntoView]);

  /**
   * Return view
   * ---
   */
  return (
    <li
      data-slot={'list-items-item'}
      ref={ref}
      onClick={() => {
        onClick && item?.element && onClick(item.element, idx ?? -1);
      }}
      className={classNames(
        styles.listItemContainer,
        scrollIntoView && !isSticky ? styles.clicked : undefined,
        hoverable ? styles.hoverable : undefined,
        item.highlighted ? styles.borderHighlighted : undefined,
        isSticky ? 'sticky' : undefined,
        isSticky ? styles.sticky : undefined,
        isSticky && stickyType === 'none' ? stickyItemStyles?.normal : undefined,
        isSticky && stickyType === 'top' ? stickyItemStyles?.stuckTop : undefined,
        isSticky && stickyType === 'bottom' ? stickyItemStyles?.stuckBottom : undefined,
      )}
      onMouseEnter={() => onHover && item.element && onHover(item.element, idx ?? -1, true)}
      onMouseLeave={() => onHover && item.element && onHover(item.element, idx ?? -1, false)}
    >
      <Render if={!hideLeft && !!item?.left}>
        <div data-slot={'list-items-item-left'} className={classNames(styles.left)}>
          <div className={styles.left_content}>{item.left}</div>
        </div>
      </Render>

      <div
        data-slot={'list-items-item-middle'}
        className={classNames(
          styles.middle,
          !item.left || hideLeft ? styles.hiddenLeft : undefined,
          !item.right || hideRight ? styles.hiddenRight : undefined,
        )}
      >
        <div data-slot={'list-items-item-title'} className={classNames(styles.titleLine)}>{item?.title ?? null}</div>
        <div data-slot={'list-items-item-content'} className={classNames(styles.contentLine)}>{item?.content ?? null}</div>
        <div data-slot={'list-items-item-last'} className={classNames(styles.lastLine)}>{item?.last ?? null}</div>
      </div>

      <Render if={!hideRight && !!item?.right}>
        <div data-slot={'list-items-item-right'} className={classNames(styles.right)}>
          <div className={styles.right_content}>{item.right}</div>
        </div>
      </Render>
    </li>
  );
};
