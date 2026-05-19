import { dFlexColumn, mb3, w100 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { updateImageUrlWithBaseRequest } from '@helpers/update-image-url-with-base-request';
import { MediaItemType } from '@models/swagger/DDD/Domain/Common/Entities/MediaItems/MediaItem';
import { StandardModalProps } from '@vanguard/Modal/ModalRoot/ModalRoot';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React, { useEffect, useState } from 'react';

import { ComponentContainer } from '../../ComponentContainer/ComponentContainer';
import { MediaItemFile } from '../../Gallery/Gallery/Gallery';
import { Modal } from '../../Modal/Modal';
import { ModalBody } from '../../Modal/ModalBody/ModalBody';
import { ModalHeader } from '../../Modal/Modalheader/ModalHeader';
import { SlideCarousel } from '../../SlideCarousel/SlideCarousel';
import styles from './PhotoCarouselModal.module.scss';

type Props = {
  gallery: MediaItemFile[];
  defaultMediaItem?: MediaItemFile;
} & StandardModalProps<any>;

export const PhotoCarouselModal = (props: Props) => {
  const { gallery, close, defaultMediaItem } = props;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (defaultMediaItem) {
      setActiveIndex(gallery.map((x) => x.uuid).indexOf(defaultMediaItem.uuid));
    }
  }, [defaultMediaItem]);

  // useEffect(() => {
  //   console.log("gallery", gallery);
  // });

  return (
    <ComponentContainer className={styles.container}>
      <Modal {...props} className="confirm-modal">
        <ModalHeader className={mb3} closeFn={close} hideCloseButtonOnMobile={false}>
          <Text fontWeight={FontWeights.bold} type={TextTypes.heading4} className={classNames(w100, mb3)}>
            Media gallery
          </Text>
        </ModalHeader>

        <ModalBody padding={0}>
          <div className={dFlexColumn}>
            <SlideCarousel
              activeIndex={activeIndex}
              initialIndex={activeIndex}
              hasBullets={gallery.length > 1}
              hasArrows={gallery.length != 1}
            >
              {gallery &&
                gallery.map((el: MediaItemFile) => {
                  // TODO: REFACTOR THIS
                  // This is very ugly implemented, but it was made on speed in order to finish the projects.
                  if ((el.file && el.fileType?.includes('video')) || el.type === MediaItemType.video) {
                    let videoURL = '';

                    if (el.file) {
                      videoURL = URL.createObjectURL(el.file);
                    } else {
                      videoURL = el.publicUrl ?? '';
                    }

                    return (
                      <video src={videoURL} width={'100%'} height={'100%'} controls className={styles.carouselVideo} />
                    );
                  }

                  const url = el.publicThumbnailUrl ?? el.publicUrl ?? el.mediaItemContent?.base64EncodedContent;
                  return (
                    <div
                      key={url}
                      draggable="false"
                      className={styles.carouselPhoto}
                      style={{
                        backgroundImage: `url(${updateImageUrlWithBaseRequest(url)})`,
                        backgroundColor: 'var(--fn-bg-var)',
                      }}
                    />
                  );
                })}
            </SlideCarousel>
          </div>
        </ModalBody>
      </Modal>
    </ComponentContainer>
  );
};
