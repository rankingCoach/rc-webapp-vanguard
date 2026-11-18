import './NotificationSource.scss';

import { dFlex } from '@globalStyles';
import * as React from 'react';

import { classNames } from '../../helpers/classNames';
import { FontWeights, Text, TextTypes } from '../Text/Text';

interface Props {
  source: 'own' | 'competitor';
}

export interface NotificationSourceProps extends Props {}

export const NotificationSource = (props: Props) => {
  const { source = 'own' } = props;

  return (
    <div data-slot={'notification-source'} className={classNames(dFlex, 'notif-source', source)}>
      <Text type={TextTypes.textCaption} textWrap={'no-wrap'} fontWeight={FontWeights.regular}>
        {source === 'own' ? 'Own notification' : 'Competitor notification'}
      </Text>
    </div>
  );
};
