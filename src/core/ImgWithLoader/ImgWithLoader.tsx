import { mr2 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Render } from '@vanguard/Render/Render';
import { Skeleton, SkeletonTypes } from '@vanguard/Skeleton/Skeleton';
import { Text, TextTypes } from '@vanguard/Text/Text';
import React, { useEffect, useRef, useState } from 'react';

import styles from './ImgWithLoader.module.scss';

export type ImgWithLoaderProps = {
  shouldShow?: boolean;
  isLoading?: boolean;
  showMediaType?: boolean;
  mediaType?: 'photo' | 'video';
  additionalText?: string;
  useBorderRadius?: boolean;
} & React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;

export const ImgWithLoader = (props: ImgWithLoaderProps) => {
  const {
    shouldShow,
    isLoading,
    showMediaType = false,
    mediaType = 'photo',
    additionalText,
    useBorderRadius = true,
    ...rest
  } = props;
  const { width, height } = rest;
  const [loading, setLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      imageLoaded();
    }
  }, []);

  const imageLoaded = () => {
    setLoading(false);
  };

  if (shouldShow === false) {
    return null;
  }

  return (
    <>
      <div data-slot="img-with-loader-placeholder" style={{ display: !isLoading && !loading ? 'none' : 'block' }}>
        <Skeleton
          type={SkeletonTypes.fill}
          style={{ height: height ?? '192px', width: width ?? '100%', minWidth: 'calc(33.33% - 16px)' }}
          className={classNames(mr2)}
        />
      </div>

      <div
        data-slot="img-with-loader"
        style={{ display: isLoading || loading ? 'none' : 'block' }}
        className={classNames(styles.imageContainer, useBorderRadius && styles.borderRadius)}
      >
        <Render if={showMediaType}>
          <div data-slot="img-with-loader-media-type" className={classNames(styles.mediaTypeInfo)}>
            <Text color={'--fn-bg'} type={TextTypes.textCaption}>
              {additionalText}
            </Text>
            <Icon color={'--fn-bg'} type={IconSize.large}>
              {mediaType === 'video' ? IconNames.media : IconNames.image}
            </Icon>
          </div>
        </Render>

        <img data-slot="img-with-loader-image" {...rest} onLoad={imageLoaded} ref={imgRef} decoding="async" />
      </div>
    </>
  );
};
