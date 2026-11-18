import { dFlexColumn } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { ActionCardActionProps } from '@vanguard/ActionCard/ActionCardActions/ActionCardAction/ActionCardAction';
import { ActionCardActions } from '@vanguard/ActionCard/ActionCardActions/ActionCardActions';
import { Render } from '@vanguard/Render/Render';
import React, { MutableRefObject } from 'react';

import styles from './ActionCard.module.scss';

export interface ActionCardProps {
  testId?: string;
  children: React.ReactNode;
  actions?: Array<ActionCardActionProps>;
  transparent?: boolean;
  id?: string;
  innerRef?: MutableRefObject<HTMLDivElement | null>;
  cardBodyStyle?: React.CSSProperties;
}

export const ActionCard = (props: ActionCardProps) => {
  const { testId, children, actions, transparent, id, innerRef, cardBodyStyle } = props;

  const primaryActions = actions?.filter((a) => !a.type || a.type === 'primary');

  return (
    <div
      data-slot={'action-card'}
      ref={innerRef}
      data-testid={'ActionCardTestId'}
      id={id}
      className={classNames(dFlexColumn, styles.card, transparent ? styles.transparent : '')}
    >
      <div data-slot={'action-card-content'} className={classNames(styles.cardBody)} style={cardBodyStyle}>
        {children}
      </div>
      <Render if={!!primaryActions}>
        <ActionCardActions actions={primaryActions} />
      </Render>
    </div>
  );
};
