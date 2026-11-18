import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { ListItem, ListItemType, StickyItemStyles, StickyType } from '@vanguard/ListItems/ListItem/ListItem';
import { Text } from '@vanguard/Text/Text';
import React, { ReactNode, useEffect, useRef, useState } from 'react';

import styles from './ListItems.module.scss';

export interface ListItemsProps<T> {
  className?: string;
  listClassName?: string;
  stickyItemStyles?: StickyItemStyles;
  testId?: string;
  items: Array<ListItemType<T>>;
  topNote?: ReactNode | string | null;
  bottomNote?: ReactNode | string | null;
  activeIndex?: number;
  stickyIndex?: number;
  onClick?: (el: T, index: number) => void;
  onHover?: (hoverEl: T, index: number, isHovered: boolean) => void;
  hasSidebarPositionCircle?: boolean;
}

export const ListItems = <ObjectType,>(props: ListItemsProps<ObjectType>) => {
  const {
    className,
    listClassName,
    testId = 'list-items-testid',
    items = [],
    topNote,
    bottomNote,
    stickyItemStyles,
    activeIndex,
    stickyIndex,
    onHover,
    onClick,
    hasSidebarPositionCircle,
  } = props;

  const ulRef = useRef<HTMLUListElement>(null);
  const [stickyType, setStickyType] = useState<StickyType>('none');
  const detectIntersection = (sticky: any[]) => {
    for (const el of sticky) {
      const rect = el.getBoundingClientRect();
      const parentRect = ulRef.current?.getBoundingClientRect();
      if (rect.top === parentRect?.top) {
        setStickyType('top');
      } else if (rect.bottom + 5 > (parentRect?.bottom ?? 0)) {
        setStickyType('bottom');
      } else {
        setStickyType('none');
      }
    }
  };

  useEffect(() => {
    if (ulRef.current) {
      const ul = ulRef.current;
      const sticky = Array.from(ul.querySelectorAll('.sticky') ?? []);
      const onScroll = () => {
        detectIntersection(sticky);
      };
      ul.addEventListener('scroll', onScroll);

      detectIntersection(sticky);
      return () => ul.removeEventListener('scroll', onScroll);
    }
  }, [ulRef, items]);

  return (
    <ComponentContainer data-slot={'list-items'} style={{ height: '100%' }} testId={testId} className={classNames(styles.container, className)}>
      {typeof topNote === 'string' ? <Text>{topNote}</Text> : topNote}
      <ul
        data-slot={'list-items-list'}
        ref={ulRef}
        style={{
          height: '99%',
          overflow: 'scroll',
          overflowX: 'hidden',
          position: 'relative',
        }}
        className={classNames(listClassName)}
      >
        {items &&
          items.map((itemCmp, i) => {
            return (
              <ListItem<ObjectType>
                key={itemCmp.id}
                idx={i}
                item={itemCmp}
                element={itemCmp.element}
                hoverable={!!onClick}
                onHover={onHover}
                onClick={onClick}
                scrollIntoView={activeIndex === i}
                isSticky={stickyIndex === i}
                stickyItemStyles={stickyItemStyles}
                stickyType={stickyType}
                hasSidebarPositionCircle={hasSidebarPositionCircle}
              />
            );
          })}
      </ul>
      {typeof bottomNote === 'string' ? <Text>{bottomNote}</Text> : bottomNote}
    </ComponentContainer>
  );
};
