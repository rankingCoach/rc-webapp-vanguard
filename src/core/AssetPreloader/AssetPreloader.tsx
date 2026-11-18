import { Avatar, AvatarIcon } from '@vanguard/Avatar/Avatar';
import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';

export interface AssetPreloaderProps {
  //TODO
  icons?: IconNames[];
  images?: string[];
  avatars?: AvatarIcon[];
}

export const AssetPreloader = (props: AssetPreloaderProps) => {
  const { icons, avatars, images } = props;

  return (
    <span
      data-slot={'asset-preloader'}
      style={{
        position: 'absolute',
        top: -10000,
        left: -10000,
        // display: "none",
      }}
    >
      {icons?.map((icon) => <Icon key={icon}>{icon}</Icon>)}
      {avatars?.map((avatar) => <Avatar icon={avatar} key={avatar} />)}
    </span>
  );
};
