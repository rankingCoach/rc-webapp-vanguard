import { dFlex, gap1 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { MediaItemFile } from '@vanguard/Gallery/Gallery/Gallery';
import { GalleryMediaItem, GalleryMediaItemAction } from '@vanguard/Gallery/Gallery/GalleryMediaItem/GalleryMediaItem';
import { IconNames } from '@vanguard/Icon/IconNames';
import { ModalService } from '@vanguard/Modal/ModalService';
import { Render } from '@vanguard/Render/Render';
import { Text } from '@vanguard/Text/Text';
import React from 'react';

import styles from './GallerySummary.module.scss';

const MAX_VISIBLE_ITEMS = 3;

interface GallerySummaryProps {
  mediaItems: MediaItemFile[];
}

export const GallerySummary = (props: GallerySummaryProps) => {
  const { mediaItems } = props;

  if (!mediaItems || mediaItems.length === 0) {
    return null;
  }

  const visibleItems = mediaItems.slice(0, MAX_VISIBLE_ITEMS);
  const remainingCount = mediaItems.length - MAX_VISIBLE_ITEMS;

  const mediaItemActions: GalleryMediaItemAction[] = [
    {
      text: 'Preview',
      icon: IconNames.visibility,
      callback: (img: MediaItemFile) => {
        const activeMediaItems = mediaItems.filter((mediaItem) => !(mediaItem?.settings?.toBeDeleted ?? false));
        ModalService.openPhotoGalleryModal(activeMediaItems, img);
      },
    },
  ];

  return (
    <div data-slot={'gallery-summary'} className={classNames(styles.gallerySummaryContainer, dFlex, gap1)}>
      {visibleItems.map((item, index) => (
        <div
          data-slot={'gallery-summary-item'}
          key={index}
          className={classNames(styles.gallerySummaryItem, index > 0 ? styles.stacked : '')}
          style={{ zIndex: MAX_VISIBLE_ITEMS - index }}
        >
          <div data-slot={'gallery-summary-image'} className={classNames(styles.gallerySummaryImage)}>
            <GalleryMediaItem
              mediaItem={item}
              width={144}
              height={144}
              actions={index === 0 ? mediaItemActions : undefined}
            />
          </div>
        </div>
      ))}

      <Render if={remainingCount > 0}>
        <div data-slot={'gallery-summary-more'} className={classNames(styles.gallerySummaryMore)}>
          <Text color={'--fn-fg-lightest'}>+{remainingCount}</Text>
        </div>
      </Render>
    </div>
  );
};
