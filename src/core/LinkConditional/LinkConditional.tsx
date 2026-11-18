import { classNames } from '@helpers/classNames';
import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Link, LinkProps } from '@vanguard/Link/Link';
import React from 'react';

import styles from './LinkConditional.module.scss';

export interface LinkConditionalProps {
  childVisible: boolean;
  children: React.ReactNode;
  linkProps?: Omit<LinkProps, 'children'>;
  linkText: string;
  childFullWidth?: boolean;
  onDeleteClick?: () => void;
}

export const LinkConditional = (props: LinkConditionalProps) => {
  const { childFullWidth, childVisible, children, linkProps, linkText, onDeleteClick } = props;

  if (!childVisible) {
    return <Link {...linkProps}>{linkText}</Link>;
  }

  return (
    <span data-slot="link-conditional" className={classNames(styles.container, childFullWidth ? styles.childFullWidth : '')}>
      {children}
      <Icon style={{ cursor: 'pointer' }} onClick={onDeleteClick}>
        {IconNames.trash}
      </Icon>
    </span>
  );
};
