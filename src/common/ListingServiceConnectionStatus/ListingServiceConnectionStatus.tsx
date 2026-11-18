import { alignItemsCenter, dFlex, justifyContentBetween, pb2, pl2 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { Avatar } from '@vanguard/Avatar/Avatar';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Link } from '@vanguard/Link/Link';
import { FontWeights, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './ListingServiceConnectionStatus.module.scss';

export interface ListingServiceConnectionStatusProps {
  picture?: string;
  fullName: string;
  disconnectCallbackClick?: () => void;
  text?: string;
  replacements?: TextReplacements;
  hasBorderBottom?: boolean;
}

export const ListingServiceConnectionStatus = (props: ListingServiceConnectionStatusProps) => {
  const { picture, disconnectCallbackClick, fullName, text, replacements, hasBorderBottom = true } = props;
  return (
    <ComponentContainer data-slot={'listing-service-connection-status-container'}>
      <div
        data-slot={'listing-service-connection-status'}
        className={classNames(dFlex, alignItemsCenter, justifyContentBetween)}
        style={hasBorderBottom ? { borderBottom: '1px solid var(--n100)' } : {}}
      >
        <div data-slot={'listing-service-connection-status-account'} className={classNames(dFlex, alignItemsCenter, pb2)}>
          {picture ? (
            <img data-slot={'listing-service-connection-status-avatar'} src={picture} alt={fullName} className={styles.avatar} />
          ) : (
            <Avatar name={fullName} size={'medium-large'} noHover={true} />
          )}

          <div data-slot={'listing-service-connection-status-details'} className={pl2}>
            <Text fontWeight={FontWeights.bold}>{fullName}</Text>
            <Link type={TextTypes.text} onClick={disconnectCallbackClick}>
              {'Disconnect and connect another account'}
            </Link>
          </div>
        </div>
        {text && <Text replacements={replacements}>{text}</Text>}
      </div>
    </ComponentContainer>
  );
};
