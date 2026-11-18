import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconNames } from '@vanguard/Icon/IconNames';
import { CtaWithIcon } from '@vanguard/Table/common/CtaWithIcon/CtaWithIcon';
import { TableContextType, TableProvider } from '@vanguard/Table/Table';
import { FontWeights, Text } from '@vanguard/Text/Text';
import React, { SyntheticEvent, useContext } from 'react';

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
      <CtaWithIcon
        onClick={(evt: SyntheticEvent) => {
          onShowLess && onShowLess();
        }}
        className={classNames(styles.linkColor)}
        icon={IconNames.caretUp}
        position={'right'}
      >
        <Text fontWeight={FontWeights.medium} color={'var(--brand-color)'}>
          Show less
        </Text>
      </CtaWithIcon>
    </ComponentContainer>
  );
};
