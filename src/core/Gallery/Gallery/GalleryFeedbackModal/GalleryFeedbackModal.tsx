import './GalleryFeedbackModal.scss';

import { alignItemsCenter, dFlex, dFlexColumn, justifyContentCenter, mb3, mr2 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalBody } from '@vanguard/Modal/ModalBody/ModalBody';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalResponse } from '@vanguard/Modal/ModalResponse';
import { Text } from '@vanguard/Text/Text';
import React, { useEffect, useState } from 'react';

import { MediaItemFile } from '../Gallery';
import { ErrorImagesList, MediaItemsErrorsDisplay } from './ErrorImagesList/ErrorImagesList';

interface Props {
  close: (value?: ModalResponse<any>) => void;
  mediaItems: MediaItemFile[];
  mediaItemsErrors: MediaItemsErrorsDisplay;
}

export const GalleryFeedbackModal = (props: Props) => {
  const { close, mediaItems, mediaItemsErrors = {} } = props;
  const [validMediaItemsCount, setValidMediaItemsCount] = useState(0);

  useEffect(() => {
    if (mediaItems) {
      for (const mediaItem of mediaItems) {
        if (!mediaItem.isInvalid) {
          setValidMediaItemsCount((prev) => prev + 1);
          continue;
        }
      }
    }
  }, []);

  return (
    <Modal {...props} className="GalleryFeedbackModal">
      <ModalHeader closeFn={close} hideCloseButtonOnMobile={false} />
      <ModalBody>
        <div data-slot="gallery-feedback-modal-body" className={classNames(dFlexColumn, alignItemsCenter, 'gallery-feedback-modal-body')}>
          {validMediaItemsCount > 0 ? (
            <div data-slot="gallery-feedback-modal-success" className={classNames(dFlex, mb3, justifyContentCenter, alignItemsCenter)}>
              <Icon className={mr2} hasCircle={true} type={IconSize.small} color={'--s500'}>
                {IconNames.check}
              </Icon>
              <Text replacements={{ imagesCount: validMediaItemsCount }}>
                {'<b>%imagesCount%</b> images were successfully added to the gallery.'}
              </Text>
            </div>
          ) : null}
          <ErrorImagesList
            validMediaItemsCount={validMediaItemsCount}
            mediaItemsErrors={mediaItemsErrors}
            invalidMediaItemsCount={mediaItems.filter((i) => i.isInvalid).length}
          />
        </div>
      </ModalBody>
    </Modal>
  );
};
