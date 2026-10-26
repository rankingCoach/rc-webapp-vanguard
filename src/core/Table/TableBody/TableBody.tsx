import { alignItemsCenter, dFlexColumn, justifyContentCenter } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { Button, ButtonSizes } from '@vanguard/Button/Button';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Render } from '@vanguard/Render/Render';
import { BlurredMessageProps, TableContextType, TableProvider } from '@vanguard/Table/Table';
import { TableBodyRenderer } from '@vanguard/Table/TableBody/TableBodyRenderer/TableBodyRenderer';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React, { Context, ReactNode, useContext } from 'react';

import { UPSELLING_LINKS_DISABLED } from '../../../UPSELLING_LINKS_DISABLED';
import styles from './TableBody.module.scss';

export type TableBodyProps = {
  children?: ReactNode | undefined;
  provider?: Context<any>;
  hasGreyBody?: boolean;
} & BlurredMessageProps;

export const TableBody = (props: TableBodyProps) => {
  const { provider = TableProvider, hasGreyBody } = props;
  const context = useContext<TableContextType>(provider as Context<any>);
  const { data, pagination } = context;

  const { blurredCta, blurredMessage, collections = [], replacements, hideBlurredMessage } = data ?? {};
  const columns = data?.columns ?? [];
  const options = data?.options ?? {};
  const limit = pagination?.limit ?? 1;

  const visibleRows = collections?.filter((row) => !row.isBlurred);
  const blurredRows = collections
    ?.filter((row) => row.isBlurred)
    .map((x) => {
      //TODO maybe scramble the keyword
      return x;
    });
  const columnsCount = columns?.length;

  /**
   * Added so message has a place to be visible
   *
   * */
  const MOCKED_BLURRED_ROWS = 3;
  if (blurredRows.length > 0 && blurredRows.length < MOCKED_BLURRED_ROWS && blurredMessage) {
    while (blurredRows.length < MOCKED_BLURRED_ROWS) {
      blurredRows.push({ isBlurred: true, [columns[0].alias]: '', prefixForColumn: null });
    }
  }

  const hasBlurredRows = blurredRows?.length > 0;

  return (
    <>
      <TableBodyRenderer
        rows={visibleRows}
        columns={columns}
        options={options}
        hideBlurred={hideBlurredMessage}
        hasGreyBody={hasGreyBody}
      />
      <Render if={hasBlurredRows}>
        <tbody className={classNames(styles.tableBody, styles.blurredTable)}>
          <Render if={!!blurredMessage && !UPSELLING_LINKS_DISABLED && !hideBlurredMessage}>
            <tr className={styles.blurredMessageContainer}>
              <td className={classNames(dFlexColumn, alignItemsCenter, justifyContentCenter)} colSpan={columnsCount}>
                <div className={styles.blurredMessage}>
                  <Text replacements={replacements} type={TextTypes.textIntro} fontWeight={FontWeights.medium}>
                    {blurredMessage}
                  </Text>
                  <Render if={!!blurredCta}>
                    <Button
                      size={ButtonSizes.extraLarge}
                      replacements={replacements}
                      onClick={blurredCta?.cta}
                      iconRight={IconNames.arrowRight}
                    >
                      {blurredCta?.text}
                    </Button>
                  </Render>
                </div>
              </td>
            </tr>
          </Render>
        </tbody>
        <TableBodyRenderer
          rows={blurredRows}
          columns={columns}
          options={options}
          hideBlurred={hideBlurredMessage}
          hasGreyBody={hasGreyBody}
        />
      </Render>
    </>
  );
};
