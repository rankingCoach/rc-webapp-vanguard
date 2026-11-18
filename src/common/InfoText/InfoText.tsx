import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './InfoText.module.scss';

export interface InfoTextProps {
  title?: string;
  replacements?: TextReplacements;
  size?: IconSize;
  onClick?: () => void;
}

export const InfoText = (props: InfoTextProps) => {
  const { title, replacements, size = IconSize.large, onClick } = props;

  return (
    <ComponentContainer data-slot={'info-text-container'}>
      <div data-slot={'info-text'} className={styles.container} onClick={onClick ? onClick : () => {}}>
        <Icon color={'--i500'} hasCircle={true} fillColor={'--i100'} type={size} className={styles.icon}>
          {IconNames.info}
        </Icon>
        <Text type={TextTypes.text} color={'--i500'} translate={true} replacements={replacements}>
          {title}
        </Text>
      </div>
    </ComponentContainer>
  );
};
