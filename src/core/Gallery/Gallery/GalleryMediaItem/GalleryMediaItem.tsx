import { useLazyImage } from '@custom-hooks/useLazyImage';
import { classNames } from '@helpers/classNames';
import { secondsToTimeDuration } from '@helpers/data-formatters';
import { updateImageUrlWithBaseRequest } from '@helpers/update-image-url-with-base-request';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { GalleryPlaceholderFormat } from '@vanguard/Gallery/Gallery/PhotoPlaceholder/PhotoPlaceholder';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Render } from '@vanguard/Render/Render';
import { Skeleton, SkeletonTypes } from '@vanguard/Skeleton/Skeleton';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import { MediaItemFile } from '../Gallery';
import { GalleryMediaItemType } from '../gallery-media-item-type';
import styles from './GalleryMediaItem.module.scss';

export type GalleryMediaItemAction = {
  callback: (mediaItemFile: MediaItemFile) => void;
  text: string;
  icon: IconNames | React.ReactNode;
  disabled?: boolean;
};

interface Props {
  mediaItem: MediaItemFile;
  actions?: GalleryMediaItemAction[];
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  format?: GalleryPlaceholderFormat;
  width?: number;
  height?: number;
}

export const GalleryMediaItem = (props: Props) => {
  const { mediaItem, actions = [], format = 'square', onSelect } = props;
  let { width, height, selectable, isSelected } = props;

  const mediaItemSrc =
    mediaItem.publicThumbnailUrl ?? mediaItem.publicUrl ?? mediaItem.mediaItemContent?.base64EncodedContent ?? '';
  const toBeDeleted = mediaItem?.settings?.toBeDeleted ?? false;
  const { isLazyLoading } = useLazyImage(mediaItemSrc);

  // If there are any actions provided, then we can not have a selection action on the image
  if (actions.length) {
    selectable = false;
    isSelected = false;
  }

  if (!width) {
    width = format === 'square' ? 152 : 274;
  }

  if (!height) {
    height = format === 'square' ? 152 : 154;
  }

  /**
   * CASE: loading
   */
  if (isLazyLoading) {
    return (
      <ComponentContainer className={styles.mediaItemContainer} style={{ width, height }}>
        <Skeleton type={SkeletonTypes.rectangle} height={height} width={width} />
      </ComponentContainer>
    );
  }

  /**
   * Return view
   */
  return (
    <ComponentContainer
      className={styles.mediaItemContainer}
      style={{ width, height }}
      onClick={() => {
        selectable && onSelect && onSelect(!isSelected);
      }}
    >
      <div
        className={classNames(styles.mediaItem, toBeDeleted ? styles.toBeDeleted : '')}
        style={{ backgroundImage: `url(${updateImageUrlWithBaseRequest(mediaItemSrc)})`, width, height }}
      >
        <Render if={selectable || !!actions.length}>
          <div
            className={classNames(
              styles.overlayOptions,
              isSelected ? styles.isSelected : undefined,
              selectable ? styles.selectable : undefined,
            )}
          >
            {actions.map((action, index) => (
              <div key={index} className={styles.actionContainer}>
                <div
                  onClick={() => {
                    if (action.disabled) {
                      return;
                    }
                    action.callback && action.callback(mediaItem);
                  }}
                  className={classNames(styles.overlayOptionText, action.disabled ? styles.disabled : '')}
                >
                  {typeof action.icon === 'object' ? (
                    action.icon
                  ) : (
                    <Icon type={IconSize.small} color={'--n100'}>
                      {action.icon as IconNames}
                    </Icon>
                  )}
                  <Text fontWeight={FontWeights.bold} color={'--n100'}>
                    {action.text}
                  </Text>
                </div>
                {/*{index < actions.length - 1 && <div className={classNames(styles.overlayOption, styles.actionDivider)} />}*/}
              </div>
            ))}
            <Render if={isSelected}>
              <Icon type={IconSize.large} color={'--fn-bg-cta-fg'}>
                {IconNames.check}
              </Icon>
            </Render>
          </div>
        </Render>

        <Render if={mediaItem.fileType?.includes('video') || mediaItem.type === GalleryMediaItemType.video}>
          <div className={classNames(styles.videoMetadataContainer)}>
            <Text type={TextTypes.textCaption} color={'--fn-bg'} className={classNames(styles.videoDuration)}>
              {mediaItem.settings?.videoDuration ?? secondsToTimeDuration(mediaItem.metadata?.videoMetadata?.duration)}
            </Text>
          </div>
        </Render>
      </div>
    </ComponentContainer>
  );
};
