import { alignItemsCenter, dFlex, gap1, mb1 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { DropdownMenu, DropdownMenuItemProps } from '@vanguard/DropdownMenu/DropdownMenu';
import { IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import React, { useRef } from 'react';

import { useToggle } from '../../../custom-hooks/useToggle';
import { ActionCardActionProps } from '../ActionCardActions/ActionCardAction/ActionCardAction';
import styles from './ActionCardHeader.module.scss';

export interface ActionCardHeaderProps {
  children: React.ReactNode;
  disabled?: boolean;
  dropdownItems?: DropdownMenuItemProps[];
  actions?: Array<ActionCardActionProps>;
}

export const ActionCardHeader = (props: ActionCardHeaderProps) => {
  const { children, disabled, actions } = props;
  const { dropdownItems = [] } = props;
  const [menuIsOpen, toggleMenuIsOpen] = useToggle(false);
  const menuAnchorEl = useRef(null);

  const secondaryActions = actions?.filter((a) => a.type === 'secondary');

  if (secondaryActions?.length) {
    dropdownItems.push(
      ...secondaryActions.map((a) => ({ title: a.label, iconName: a.iconLeft ?? a.iconRight, onClick: a.cta })),
    );
  }

  const visible = !!dropdownItems.length;

  return (
    <div className={classNames(dFlex, alignItemsCenter, mb1, gap1)}>
      {children}
      <div>
        <Button
          targetRef={menuAnchorEl}
          disabled={disabled}
          visible={visible}
          className={classNames(styles.openMenuCta)}
          testId={'action-card-header-open-menu-cta'}
          type={ButtonTypes.default}
          size={ButtonSizes.medium}
          iconLeft={IconNames.meatballsMenu}
          iconSize={IconSize.large}
          iconColor={'--n500'}
          iconHoverColor={'--n700'}
          onClick={(e) => {
            if (disabled) {
              return false;
            }
            toggleMenuIsOpen();
          }}
        />
        <DropdownMenu
          anchorEl={menuAnchorEl}
          isOpen={menuIsOpen}
          toggleIsOpen={toggleMenuIsOpen}
          placement={'bottom-end'}
          items={dropdownItems}
        />
      </div>
    </div>
  );
};
