import { alignItemsCenter, dFlex } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { AnimatedConditional } from '@vanguard/AnimatedConditional/AnimatedConditional';
import { TableContextType, TableProvider } from '@vanguard/Table/Table';
import { FooterPagination } from '@vanguard/Table/TableFooter/FooterPagination/FooterPagination';
import { FooterShowMore } from '@vanguard/Table/TableFooter/FooterShowMore/FooterShowMore';
import React, { Context, ReactNode, useContext } from 'react';

import { FooterShowLess } from './FooterShowLess/FooterShowLess';
import styles from './TableFooter.module.scss';

export interface TableFooterProps {
  children?: ReactNode | undefined;
  provider?: Context<TableContextType>;
}

export const TableFooter = (props: TableFooterProps) => {
  const { children, provider = TableProvider } = props;
  const context = useContext<TableContextType>(provider);
  const { data } = context;
  const columns = data?.columns ?? [];
  const columnsCount = columns?.length;

  const limit = context.pagination?.limit ?? 1;
  const total = context.pagination?.total ?? 1;

  return (
    <tfoot data-slot={'table-footer'}>
      <tr data-slot={'table-footer-row'} className={styles.tableFooter}>
        <td data-slot={'table-footer-cell'} colSpan={columnsCount}>
          <div data-slot={'table-footer-controls'} className={classNames(dFlex, alignItemsCenter)}>
            <AnimatedConditional condition={limit <= total && total > 6}>
              <div data-slot={'table-footer-more-controls'} className={styles.sideLeft}>
                <FooterShowLess isHidden={limit < total} />
                <FooterShowMore isHidden={limit === total} />
              </div>
            </AnimatedConditional>
            <div data-slot={'table-footer-pagination'} className={classNames(dFlex, alignItemsCenter, styles.sideRight)}>
              <FooterPagination />
            </div>
          </div>
          {children ?? null}
        </td>
      </tr>
    </tfoot>
  );
};
