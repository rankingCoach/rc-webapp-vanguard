import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconNames } from '@vanguard/Icon/IconNames';
import { TableContextType, TableProvider } from '@vanguard/Table/Table';
import React, { useContext } from 'react';

import { FooterAction } from '../FooterAction/FooterAction';
import styles from './FooterShowLess.module.scss';

export interface FooterShowLessProps {
  isHidden?: boolean;
}

export const FooterShowLess = (props: FooterShowLessProps) => {
  const { isHidden } = props;

  const context = useContext<TableContextType>(TableProvider);
  const { onShowLess } = context;

  if (isHidden) {
    return null;
  }
  return (
    <ComponentContainer data-slot={'footer-show-less-container'}>
      <FooterAction
        label={'Show less'}
        onClick={() => onShowLess && onShowLess()}
        className={classNames(styles.linkColor)}
        icon={IconNames.caretUp}
        position={'right'}
      />
    </ComponentContainer>
  );
};
