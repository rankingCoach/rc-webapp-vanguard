import './ContentPlaceholder.scss';

import { Render } from '@vanguard/Render/Render';
import React from 'react';

import { ImplementDetailsModal } from '../../CustomModals/ImplementDetailsModal/ImplementDetailsModal';
import { Icon, IconSize } from '../../Icon/Icon';
import { IconNames } from '../../Icon/IconNames';
import { ModalService } from '../../Modal/ModalService';
import { FontWeights, Text, TextTypes } from '../../Text/Text';

interface Props {
  item?: any;
}

export const ContentPlaceholder = (props: Props) => {
  const { item } = props;

  const openModal = () => {
    const closeFn = () => {
      console.log('We have closed');
    };

    ModalService.open(<ImplementDetailsModal close={closeFn} item={item} />);
  };

  return (
    <div data-slot={'content-placeholder'} onClick={openModal} className={'notif-content-placeholder'}>
      <Render if={item}>
        <Icon type={IconSize.small}>{IconNames.refresh}</Icon>
      </Render>
      <Text type={TextTypes.text} fontWeight={FontWeights.medium}>
        {item ? 'CLICK ME' : 'Placeholder zone'}
      </Text>
    </div>
  );
};
