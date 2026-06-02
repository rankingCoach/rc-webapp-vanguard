import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import';
import { classNames } from '@helpers/classNames';
import { generateColorFromInitials } from '@helpers/color-helpers';
import { getNameInitials as getNameInitialsHelper } from '@helpers/string-helpers';
import { updateImageUrlWithBaseRequest } from '@helpers/update-image-url-with-base-request';
import { AvatarIconMap, KeyOfAvatarIconMap } from '@vanguard/Avatar/Avatar.enum';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import * as React from 'react';

import { StyledSVG } from '../StyledSVG/StyledSVG';
import style from './Avatar.module.scss';

export type AvatarIcon = KeyOfAvatarIconMap;

export type AvatarSize = 'large' | 'medium' | 'medium-large' | 'medium-40' | 'small' | 'xs';
type BaseAvatarProps = {
  size?: AvatarSize;
  hasNotifications?: boolean;
  name?: string;
  fullName?: string;
  bgColor?: string;
  noHover?: boolean;
  greyScale?: boolean;
  translate?: boolean;
  clearIcon?: string;
};

export type AvatarProps = BaseAvatarProps & {
  icon?: AvatarIcon | string;
  image?: string;
};

export const Avatar = (props: AvatarProps) => {
  const {
    size = 'medium',
    hasNotifications = false,
    name,
    fullName,
    bgColor,
    noHover,
    translate = false,
    greyScale = false,
    clearIcon,
  } = props;
  const { icon = '', image } = props;
  const SvgName = `${AvatarIconMap[icon]}`;
  const showNotifications = hasNotifications && size !== 'small';
  let { SvgIcon, loading, error } = useDynamicImport(`avatarIcons/listings/${SvgName}.svg`, {
    shouldRequest: !!SvgName,
  });

  if (clearIcon) {
    SvgIcon = '';
  }
  let sizePixels = 0;
  switch (size) {
    case 'large':
      sizePixels = 56;
      break;
    case 'medium-large':
      sizePixels = 48;
      break;
    case 'medium-40':
      sizePixels = 40;
      break;
    case 'medium':
      sizePixels = 32;
      break;
    case 'small':
      sizePixels = 24;
      break;
    case 'xs':
      sizePixels = 16;
      break;
  }

  const getNameInitials = () => {
    if (name) {
      return getNameInitialsHelper(name);
    }
  };

  const nameInitialsText = () => {
    let nameInitialsTextValue = '';
    getNameInitials()?.forEach((value: string) => {
      nameInitialsTextValue += value;
    });

    return nameInitialsTextValue;
  };

  if (image) {
    return (
      <div
        data-testid={'avatar-image-test-id'}
        className={classNames(
          style.rcAvatar,
          style.rcAvatarImage,
          noHover ? style.noHover : null,

          greyScale ? style.greyScale : undefined,
        )}
        style={{
          backgroundImage: `url(${updateImageUrlWithBaseRequest(image)})`,
          width: sizePixels,
          height: sizePixels,
        }}
      >
        {showNotifications && (
          <div data-testid={'avatar-notifications-test-id'} className={classNames(style.rcAvatarNotification)} />
        )}
      </div>
    );
  }
  if (icon) {
    //@ts-ignore
    if (SvgIcon) {
      return (
        <div
          data-testid={'avatar-icon-test-id'}
          className={classNames(style.rcAvatar, greyScale ? style.greyScale : undefined)}
        >
          {showNotifications && (
            <div data-testid={'avatar-notifications-test-id'} className={classNames(style.rcAvatarNotification)} />
          )}
          <StyledSVG width={sizePixels} height={sizePixels} src={SvgIcon} className={style.avatarSvg} />
        </div>
      );
    }
    if (!loading && error) {
      //console.info(`AVATAR | Icon not found | Icon name '${icon}' mapped to `, AvatarIconMap[icon]);
    }
  }

  const bgColorToDisplay = bgColor ? bgColor : generateColorFromInitials(getNameInitials() ?? []);
  const nameToDisplay = fullName ? fullName : nameInitialsText();
  const textSizeAdjustment = 2 * Math.log1p(nameToDisplay.length);
  return (
    <div
      data-testid={'avatar-name-test-id'}
      className={classNames(
        style.rcAvatar,
        style.rcAvatarName,
        noHover ? style.noHover : null,
        greyScale ? style.greyScale : undefined,
      )}
      style={{
        backgroundColor: `var(${bgColorToDisplay})`,
        width: sizePixels,
        height: sizePixels,
        borderRadius: '50%',
      }}
    >
      {showNotifications && (
        <div data-testid={'avatar-notifications-test-id'} className={classNames(style.rcAvatarNotification)} />
      )}
      <Text
        type={TextTypes.textHelp}
        fontSize={textSizeAdjustment ? sizePixels / textSizeAdjustment : sizePixels}
        fontWeight={FontWeights.bold}
        color={'--n000'}
        translate={translate}
      >
        {nameToDisplay}
      </Text>
    </div>
  );
};
