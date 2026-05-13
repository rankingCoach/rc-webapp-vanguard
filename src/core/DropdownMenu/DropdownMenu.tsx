import { classNames } from '@helpers/classNames';
import { uuidv4 } from '@helpers/generate-uid';
import { ClickAwayListener, Fade, MenuItem, MenuList, Popper as MuiPopper } from '@mui/material';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Icon, IconProps } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { MODAL_BASE_Z_INDEX, ModalService } from '@vanguard/Modal/ModalService';
import { Text } from '@vanguard/Text/Text';
import React, { RefObject, useEffect, useRef, useState } from 'react';

import styles from './DropdownMenu.module.scss';

export interface DropdownMenuItemProps {
  selected?: boolean;
  title: string;
  iconName?: IconNames;
  iconProps?: IconProps;
  onClick?: () => void;
}

export interface DropdownMenuProps {
  anchorEl?: RefObject<any>; // Used to set Menu's position
  isOpen: boolean;
  toggleIsOpen: () => void;
  items: DropdownMenuItemProps[];
  hideOnItemClick?: boolean;
  placement?:
    | 'auto'
    | 'auto-end'
    | 'auto-start'
    | 'bottom'
    | 'bottom-end'
    | 'bottom-start'
    | 'top'
    | 'top-end'
    | 'top-start'
    | 'left'
    | 'left-end'
    | 'left-start'
    | 'right'
    | 'right-end'
    | 'right-start';
}

export const DropdownMenu = (props: DropdownMenuProps) => {
  const { anchorEl, isOpen, toggleIsOpen, items, hideOnItemClick = true, placement = 'bottom' } = props;
  const [arrowRef, setArrowRef] = useState<null | HTMLDivElement>(null);

  // Register with the shared stacking ledger on open so we sit above all modals
  // currently mounted. A modal that opens AFTER us will land above our slot
  // (correct UX: the new modal should cover the stale popover).
  const popoverIdRef = useRef<string>(`dropdown-${uuidv4()}`);
  const [zIndex, setZIndex] = useState(MODAL_BASE_Z_INDEX);

  useEffect(() => {
    if (!isOpen) {
      setZIndex(MODAL_BASE_Z_INDEX);
      return;
    }
    const id = popoverIdRef.current;
    setZIndex(ModalService.registerPopover(id));
    return () => ModalService.unregisterPopover(id);
  }, [isOpen]);

  /**
   * Function: handle List Key Down
   */
  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      toggleIsOpen();
    } else if (event.key === 'Escape') {
      toggleIsOpen();
    }
  }

  /**
   * Event: on Menu Item Clicked
   */
  const onItemClick = (onClick?: () => void) => {
    onClick && onClick();
    if (hideOnItemClick) {
      toggleIsOpen();
    }
  };

  /**
   * Event: on Click Away
   */
  const onClickAway = (event: Event | React.SyntheticEvent) => {
    if (anchorEl && anchorEl.current && anchorEl.current.contains(event.target as HTMLElement)) {
      return;
    }
    event.preventDefault();
    toggleIsOpen();
  };

  /**
   * Return View
   */
  return (
    <ComponentContainer>
      <MuiPopper
        style={{
          zIndex,
        }}
        role={undefined}
        open={isOpen}
        anchorEl={anchorEl && anchorEl.current}
        placement={placement}
        modifiers={[
          {
            name: 'arrow',
            enabled: true,
            options: {
              element: arrowRef,
            },
          },
          {
            name: 'offset',
            options: {
              offset: [0, 20],
            },
          },
        ]}
        transition={true}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} timeout={250}>
            <div>
              <div className={classNames(styles.arrow)} ref={setArrowRef} />
              <ClickAwayListener onClickAway={onClickAway}>
                <MenuList autoFocusItem={isOpen} className={styles.menu} onKeyDown={handleListKeyDown}>
                  {items.map((item, index) => {
                    return (
                      <MenuItem
                        key={index}
                        className={styles.item}
                        onClick={() => onItemClick(item.onClick)}
                        selected={item.selected}
                      >
                        {item.iconName && <Icon {...item.iconProps}>{item.iconName}</Icon>}
                        <Text>{item.title}</Text>
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </ClickAwayListener>
            </div>
          </Fade>
        )}
      </MuiPopper>
    </ComponentContainer>
  );
};
