import { classNames } from '@helpers/classNames';
import { IconNames } from '@vanguard/Icon/IconNames';
import { TableContextType, TableProvider } from '@vanguard/Table/Table';
import React, { useContext, useEffect, useState } from 'react';

import { FooterAction } from '../FooterAction/FooterAction';
import styles from './FooterPagination.module.scss';

export type TablePaginationProps = {
  total: number;
  limit: number;
  offset: number;
  page: number;
  minPage: number;
  maxPage: number;
  step: number;
};

export interface FooterPaginationProps {
  isHidden?: boolean;
}

export const FooterPagination = (props: FooterPaginationProps) => {
  const { isHidden = false } = props;

  const [disabled, setDisabled] = useState<boolean>(false);
  const [disabledNext, setDisabledNext] = useState<boolean>(false);
  const [disabledBack, setDisabledBack] = useState<boolean>(false);

  const context = useContext<TableContextType>(TableProvider);
  const { data, onNextPage, onPrevPage, pagination } = context;
  const columns = data?.columns ?? [];

  const minPage = pagination?.minPage ?? 1;
  const maxPage = pagination?.maxPage ?? undefined;
  const limit = pagination?.limit ?? 1;
  const offset = pagination?.offset ?? 0;
  const total = pagination?.total ?? 1;
  const page = (offset + limit) / limit;

  if (isHidden) {
    return null;
  }

  useEffect(() => {
    if (offset + limit >= total) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }

    setDisabledNext(parseInt(String(page)) == parseInt(String(maxPage)));
    setDisabledBack(parseInt(String(page)) == parseInt(String(minPage)));
  }, [pagination]);

  return (
    <>
      <FooterAction
        label={'Back'}
        disabled={disabledBack}
        onClick={() => onPrevPage && onPrevPage(offset)}
        className={classNames(styles.spacer, styles.linkColor, styles.disabled)}
        icon={IconNames.caretRight}
        position={'left'}
      />
      <FooterAction
        label={'Next'}
        disabled={disabledNext}
        onClick={() => onNextPage && onNextPage(offset)}
        className={classNames(styles.linkColor)}
        icon={IconNames.caretLeft}
        position={'right'}
      />
    </>
  );
};
