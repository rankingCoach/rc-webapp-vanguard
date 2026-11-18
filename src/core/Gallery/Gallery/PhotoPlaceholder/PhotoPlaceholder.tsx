import './PhotoPlaceholder.scss';

import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, Text } from '@vanguard/Text/Text';
import React from 'react';

export type GalleryPlaceholderFormat = 'square' | 'wide';

interface Props {
  onClick?: () => void;
  visible?: boolean;
  text?: string;
  icons?: IconNames[];
  format?: GalleryPlaceholderFormat;
}

export const PhotoPlaceholder = (props: Props) => {
  const { onClick, visible, text, format = 'square', icons } = props;

  if (!visible) {
    return null;
  }

  const firstIcon = icons?.[0] ?? IconNames.image;
  const secondIcon = icons?.[1];

  return (
    <ComponentContainer
      data-slot="photo-placeholder"
      data-variant={format}
      onClick={() => onClick && onClick()}
      className={classNames('PhotoPlaceholder-container', `format-${format}`)}
    >
      <Render if={!secondIcon}>
        <Icon type={IconSize.large} hasCircle={true} color={'--n000'} fillColor={'--p500'} circleSize={40}>
          {firstIcon}
        </Icon>
      </Render>

      <Render if={!!secondIcon}>
        <div data-slot="photo-placeholder-icons" className={classNames('PhotoPlaceholder-multiple-icons-container')}>
          <Icon type={IconSize.large} color={'--n000'} className={classNames('first-icon')}>
            {firstIcon}
          </Icon>

          <Icon type={IconSize.large} color={'--n000'} className={classNames('second-icon')}>
            {secondIcon ?? IconNames.media}
          </Icon>
        </div>
      </Render>

      <Text fontWeight={FontWeights.bold} color={'--p500'}>
        {text ?? 'add photo/s'}
      </Text>
    </ComponentContainer>
  );
};
