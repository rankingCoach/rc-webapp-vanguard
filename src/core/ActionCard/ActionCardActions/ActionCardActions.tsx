import {
  ActionCardAction,
  ActionCardActionProps,
} from '@vanguard/ActionCard/ActionCardActions/ActionCardAction/ActionCardAction';
import React from 'react';

import styles from './ActionCardActions.module.scss';

export interface ActionCardActionsProps {
  actions?: Array<ActionCardActionProps>;
}

export const ActionCardActions = (props: ActionCardActionsProps) => {
  let { actions = [] } = props;
  actions = actions.filter((x) => !!x);
  return (
    <div data-slot={'action-card-actions'} className={styles.actionsContainer}>
      {actions.map((action, index) => {
        return (
          <ActionCardAction
            key={index}
            {...action}
            width={100 / actions.length}
            testId={`ActionCardActionTest${index}`}
          />
        );
      })}
    </div>
  );
};
