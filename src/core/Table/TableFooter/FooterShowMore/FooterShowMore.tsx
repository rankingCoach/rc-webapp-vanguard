import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconNames } from '@vanguard/Icon/IconNames';
import { CtaWithIcon } from '@vanguard/Table/common/CtaWithIcon/CtaWithIcon';
import { TableContextType, TableProvider } from '@vanguard/Table/Table';
import { FontWeights, Text } from '@vanguard/Text/Text';
import React, { SyntheticEvent, useContext, useEffect, useState } from 'react';

import styles from './FooterShowMore.module.scss';

export interface FooterShowMoreProps {
  isHidden?: boolean;
}

export const FooterShowMore = (props: FooterShowMoreProps) => {
  const { isHidden = false } = props;

  const context = useContext<TableContextType>(TableProvider);
  const { data, onShowMore, pagination } = context;
  const columns = data?.columns ?? [];
  const [disabled, setDisabled] = useState<boolean>(false);

  const limit = pagination?.limit ?? 1;
  const offset = pagination?.offset ?? 0;
  const total = pagination?.total ?? 1;

  useEffect(() => {
    if (offset + limit >= total) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [pagination]);

  if (isHidden) {
    return null;
  }
  return (
    <ComponentContainer data-slot={'footer-show-more-container'}>
      <CtaWithIcon
        onClick={(evt: SyntheticEvent) => {
          onShowMore && onShowMore(limit);
        }}
        disabled={disabled}
        className={classNames(styles.linkColor)}
        icon={IconNames.caretDown}
        position={'right'}
      >
        <Text fontWeight={FontWeights.medium} color={disabled ? 'var(--n300)' : 'var(--brand-color)'}>
          Show more
        </Text>
      </CtaWithIcon>
    </ComponentContainer>
  );
};
