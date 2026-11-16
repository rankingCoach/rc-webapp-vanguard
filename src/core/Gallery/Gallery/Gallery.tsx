import './Gallery.scss';

import { useToggle } from '@custom-hooks/useToggle';
import { dFlex, dFlexColumn, gap1, mb1 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { downloadZipFile } from '@helpers/download-helpers';
import { uuidv4 } from '@helpers/generate-uid';
import { ExtendedCropperProps } from '@vanguard/Cropper/Cropper';
import { ContentType } from '@vanguard/Documents/Document.types';
import { ImageContentProcessor } from '@vanguard/FileSelect/MediaItemProcessors/ImageContentProcessor';
import { ImageMetadataProcessor } from '@vanguard/FileSelect/MediaItemProcessors/ImageMetadataProcessor';
import { VideoMetadataProcessor } from '@vanguard/FileSelect/MediaItemProcessors/VideoMetadataProcessor';
import { VideoThumbnailProcessor } from '@vanguard/FileSelect/MediaItemProcessors/VideoThumbnailProcessor';
import { ImageCompressorTransformer } from '@vanguard/FileSelect/MediaItemTransformers/ImageCompressorTransformer';
import { ImageCropperTransformer } from '@vanguard/FileSelect/MediaItemTransformers/ImageCropperTransformer';
import { FileSizeValidator } from '@vanguard/FileSelect/MediaItemValidators/FileSizeValidator';
import { FileTypeValidator } from '@vanguard/FileSelect/MediaItemValidators/FileTypeValidator';
import { ImageResolutionValidator } from '@vanguard/FileSelect/MediaItemValidators/ImageResolutionValidator';
import { VideoDurationValidator } from '@vanguard/FileSelect/MediaItemValidators/VideoDurationValidator';
import { VideoResolutionValidator } from '@vanguard/FileSelect/MediaItemValidators/VideoResolutionValidator';
import {
  IMAGE_VALIDATION_ERRORS,
  POST_VIDEO_VALIDATION_REQUIREMENTS,
} from '@vanguard/FileSelect/validation-helpers/media-items-validations';
import { Icon } from '@vanguard/Icon/Icon';
import { InfoBox, InfoBoxProps } from '@vanguard/InfoBox/InfoBox';
import { Popover } from '@vanguard/Popover/Popover';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import Compressor from 'compressorjs';
import React, { useEffect, useState } from 'react';

import { FilePriority, MediaItemSelectInput } from '../../FileSelect/MediaItemSelectInput';
import { IconNames } from '../../Icon/IconNames';
import { ModalService } from '../../Modal/ModalService';
import { snackbarService } from '../../SnackbarRoot/SnackBarService';
import { MediaItemsErrorsDisplay } from './GalleryFeedbackModal/ErrorImagesList/ErrorImagesList';
import { GalleryFeedbackModal } from './GalleryFeedbackModal/GalleryFeedbackModal';
import { GalleryMediaItem, GalleryMediaItemAction } from './GalleryMediaItem/GalleryMediaItem';
import { GalleryPlaceholderFormat, PhotoPlaceholder } from './PhotoPlaceholder/PhotoPlaceholder';

export const GALLERY_PHOTO_SCOPE = 'PHOTO';

export type MediaItemFile = {
  publicUrl?: string;
  publicThumbnailUrl?: string;
  id?: number;
  settings?: {
    toBeDeleted?: boolean;
    isAIGenerated?: boolean;
    removed?: boolean;
    /** A video's duration as the backend formats it; shown instead of the measured one when set. */
    videoDuration?: string | null;
    objectType: string;
  };
  mediaItemContent?: {
    base64EncodedContent?: string;
    fileFormat?: string;
    objectType: string;
  };
  scope?: string;
  objectType: string;
  uuid?: string;
  filePriority?: FilePriority;
  mediaItemName?: string;
  mediaItemLabel?: string;
  file?: File | Blob;
  fileType?: ContentType;
  metadata?: MediaItemMetadata;
  /** Usually a `GalleryMediaItemType` value (`photo`, `video`, `DOCUMENT`). */
  type?: string;
  isInvalid?: boolean;
  validationErrors?: { text: string; replacements?: TextReplacements }[];
};

export type MediaItemMetadata = {
  videoMetadata?: VideoMetadata;
  imageMetadata?: ImageMetadata;
};

export type VideoMetadata = {
  duration?: number;
  width?: number;
  height?: number;
};

export type ImageMetadata = {
  width?: number;
  height?: number;
};

export type MediaItemFileWithMandatoryUid = MediaItemFile & {
  uuid: string;
};

const addUidToMediaItemFile = (mediaItems: MediaItemFile[]): MediaItemFileWithMandatoryUid[] => {
  return mediaItems.map((x) => {
    const withMandatory: MediaItemFileWithMandatoryUid = { ...x, uuid: x.uuid ?? uuidv4() };
    return withMandatory;
  });
};

export type GalleryChange = (type: 'ADD' | 'DELETE', modified: MediaItemFile[], allMediaItems: MediaItemFile[]) => void;

interface Props {
  className?: string;
  mediaItems: MediaItemFile[];
  editMode: boolean;
  onChange?: GalleryChange;
  canDownload?: boolean;
  downloading?: boolean;
  downloadCallback?: (mediaItem: MediaItemFile) => void;
  onSecondaryChange?: GalleryChange;
  placeholderConfig?: {
    text: string;
    format?: GalleryPlaceholderFormat;
  };
  config?: {
    maxNumberOfMediaItems?: number;
    maxNumberOfMediaItemsPerType?: Record<string, number>;
    removeDuplicates?: boolean;
    useCompressor?: boolean;
    compressorOptions?: Compressor.Options | undefined;
    useCropper?: boolean;
    cropperOptions?: ExtendedCropperProps | undefined;
    showFeedbackModal?: boolean;
    showLoadingModalDuringCompression?: boolean;
    acceptTypes?: ContentType[];
    acceptDifferentFileTypes?: boolean;
    alertType?: 'snackbar' | 'inline';
    forceOpenFileSelect?: boolean;
  };
}

export const Gallery = (props: Props) => {
  const {
    mediaItems = [],
    editMode,
    placeholderConfig,
    onChange,
    onSecondaryChange,
    canDownload,
    downloading,
    downloadCallback,
    className = '',
  } = props;

  /**
   * Configs
   */
  let { config } = props;
  if (!config) {
    config = {} as never;
  }

  if (config?.showFeedbackModal === undefined) {
    config.showFeedbackModal = true;
  }

  const maxNumberOfMediaItems = config?.maxNumberOfMediaItems ?? 30;

  const acceptTypes = config?.acceptTypes ?? [ContentType.IMAGE_JPEG, ContentType.IMAGE_PNG, ContentType.IMAGE_JPG];
  const addNewicons = acceptTypes.some((type) => type.includes('video'))
    ? [IconNames.image, IconNames.media]
    : [IconNames.image];

  const alertType = config?.alertType ?? 'snackbar';

  const forceOpenFileSelect = config?.forceOpenFileSelect ?? false;

  const compressorOptions = {
    maxWidth: 3000,
    maxHeight: 3000,
    minHeight: 720,
    minWidth: 720,
    quality: 0.9,
    convertSize: 5242880, // 5 MB in bytes
    ...config.compressorOptions,
  };

  /** Transformers Layer */
  const imageCropperTransformer = config.useCropper
    ? new ImageCropperTransformer({ options: config.cropperOptions })
    : null;
  const imageCompressorTransformer = config.useCompressor
    ? new ImageCompressorTransformer({
        compressorOptions,
        showLoadingModalDuringCompression: config.showLoadingModalDuringCompression,
      })
    : null;

  /** Processors Layer */
  const imageContentProcessor = new ImageContentProcessor({});
  const imageMetadataProcessor = new ImageMetadataProcessor({});
  const videoThumbnailProcessor = new VideoThumbnailProcessor({});
  const videoMetadataProcessor = new VideoMetadataProcessor({});

  /** Validators Layer */
  const fileTypeValidator = new FileTypeValidator({
    applicableFileTypes: [ContentType.FILE_ANY],
    acceptedTypes: acceptTypes,
  });
  const imageFileSizeValidator = new FileSizeValidator({
    applicableFileTypes: [ContentType.IMAGE_ANY, ContentType.IMAGE_JPEG, ContentType.IMAGE_JPG, ContentType.IMAGE_PNG],
    maxSize: 5242880, // 5 MB in bytes,
    minSize: 10240, // 10 KB in bytes
  });
  const videoFileSizeValidator = new FileSizeValidator({
    applicableFileTypes: [ContentType.VIDEO_ANY, ContentType.VIDEO_MOV, ContentType.VIDEO_MP4],
    maxSize: POST_VIDEO_VALIDATION_REQUIREMENTS.POST_VIDEO_MAX_SIZE,
    minSize: POST_VIDEO_VALIDATION_REQUIREMENTS.POST_VIDEO_MIN_SIZE,
  });
  const videoDurationValidator = new VideoDurationValidator({
    minDuration: POST_VIDEO_VALIDATION_REQUIREMENTS.POST_VIDEO_MIN_DURATION,
    maxDuration: POST_VIDEO_VALIDATION_REQUIREMENTS.POST_VIDEO_MAX_DURATION,
  });
  const imageResolutionValidator = new ImageResolutionValidator({
    minWidth: compressorOptions.minWidth,
    minHeight: compressorOptions.minHeight,
    maxWidth: compressorOptions.maxWidth,
    maxHeight: compressorOptions.maxHeight,
    minAspectRatio: config?.cropperOptions?.aspectRatio,
    maxAspectRatio: config?.cropperOptions?.secondaryAspectRatio,
  });
  const videoResolutionValidator = new VideoResolutionValidator({
    minWidth: POST_VIDEO_VALIDATION_REQUIREMENTS.POST_VIDEO_MIN_WIDTH,
    minHeight: POST_VIDEO_VALIDATION_REQUIREMENTS.POST_VIDEO_MIN_HEIGHT,
    maxWidth: POST_VIDEO_VALIDATION_REQUIREMENTS.POST_VIDEO_MAX_WIDTH,
    maxHeight: POST_VIDEO_VALIDATION_REQUIREMENTS.POST_VIDEO_MAX_HEIGHT,
    minAspectRatio: POST_VIDEO_VALIDATION_REQUIREMENTS.POST_VIDEO_MIN_ASPECT_RATIO,
    maxAspectRatio: POST_VIDEO_VALIDATION_REQUIREMENTS.POST_VIDEO_MAX_ASPECT_RATIO,
  });

  /**
   * State
   */
  const [selectMediaItem, toggleSelectMediaItem] = useToggle(forceOpenFileSelect);
  const [displayMediaItems, setDisplayMediaItems] = useState<MediaItemFileWithMandatoryUid[]>(
    addUidToMediaItemFile(mediaItems),
  );
  const [displaySecondaryMediaItems, setDisplaySecondaryMediaItems] = useState<MediaItemFileWithMandatoryUid[]>(
    addUidToMediaItemFile([]),
  );
  const [inlineAlert, setInlineAlert] = useState<InfoBoxProps>({
    title: '',
    description: '',
    dismissible: true,
    position: 'start',
  });

  // Set display MediaItems when mediaItems change (basically identical to onMount)
  useEffect(() => {
    setDisplayMediaItems(addUidToMediaItemFile(mediaItems));
  }, [mediaItems]);

  /**
   * FUNCTION: Delete MediaItem
   * -------------------------------------------------------------------------------------------------------------------
   */
  const deleteMediaItem = (toDelete: MediaItemFile) => {
    const leftMediaItems = displayMediaItems.filter((x) => {
      return x.uuid !== toDelete.uuid;
    });

    setDisplayMediaItems(leftMediaItems);
    onChange && onChange('DELETE', [toDelete], leftMediaItems);
  };

  /**
   * FUNCTION: Download MediaItem
   * -------------------------------------------------------------------------------------------------------------------
   */
  const downloadMediaItem = (toDownload: MediaItemFile) => {
    const leftMediaItems = displayMediaItems.filter((x) => {
      return x.uuid !== toDownload.uuid;
    });

    downloadZipFile(
      [{ src: leftMediaItems[0].publicUrl ?? '', name: leftMediaItems[0].mediaItemName ?? 'img' }],
      'zipfile',
    );
  };

  /**
   * FUNCTION: Upload MediaItem/s
   * -------------------------------------------------------------------------------------------------------------------
   */
  const uploadMediaItems = (selectedMediaItems: MediaItemFile | MediaItemFile[]) => {
    const mediaItems = Array.isArray(selectedMediaItems) ? selectedMediaItems : [selectedMediaItems];

    const totalMediaItems = [...displayMediaItems, ...mediaItems];
    if (totalMediaItems.length > maxNumberOfMediaItems) {
      alertOneError('Please select fewer media items');
      return;
    }

    // DIFFERENT FILE FORMAT VALIDATION
    if (!config?.acceptDifferentFileTypes) {
      // Extract UNIQUE media types from media items.
      const mediaTypes = [...new Set(mediaItems.map((mediaItem) => mediaItem.file?.type?.split('/')[0]))];

      if (
        mediaTypes.length > 1 &&
        config &&
        config.maxNumberOfMediaItemsPerType &&
        config.maxNumberOfMediaItemsPerType['video'] &&
        config.maxNumberOfMediaItemsPerType['image']
      ) {
        setInlineAlert({
          ...inlineAlert,
          title: 'Reduce media',
          replacements: {
            videoCount: config.maxNumberOfMediaItemsPerType['video'],
            imagesCount: config.maxNumberOfMediaItemsPerType['image'],
          },
          description: 'Only one type of media is allowed — up to %imagesCount% photos or %videoCount% video.',
          type: 'danger',
        });

        return;
      }
    }

    // MAX NUMBER OF MEDIA ITEMS PER TYPE VALIDATION
    if (config?.maxNumberOfMediaItemsPerType) {
      const videoFiles = mediaItems.filter((m) => m.fileType?.includes('video'));
      const imageFiles = mediaItems.filter((m) => m.fileType?.includes('image'));

      if (
        config.maxNumberOfMediaItemsPerType['video'] &&
        videoFiles.length > config.maxNumberOfMediaItemsPerType['video']
      ) {
        alertOneError('Each post can include only %videoCount% video.', {
          videoCount: config.maxNumberOfMediaItemsPerType['video'],
        });
        return;
      }

      if (
        config.maxNumberOfMediaItemsPerType['image'] &&
        imageFiles.length > config.maxNumberOfMediaItemsPerType['image']
      ) {
        alertOneError('Each post can include only %imagesCount% images.', {
          imagesCount: config.maxNumberOfMediaItemsPerType['image'],
        });
        return;
      }
    }

    // DUPLICATE CHECK VALIDATION
    if (config?.removeDuplicates) {
      mediaItems.map((mediaItem) => {
        if (
          !!displayMediaItems.find((displayPhoto) => {
            return (displayPhoto?.file as File)?.name === (mediaItem.file as File)?.name;
          })
        ) {
          mediaItem.isInvalid = true;
          if (!mediaItem.validationErrors) {
            mediaItem.validationErrors = [];
          }

          mediaItem.validationErrors.push({
            text: IMAGE_VALIDATION_ERRORS.DUPLICATE,
          });
        }
      });
    }

    const files = Array.isArray(selectedMediaItems) ? selectedMediaItems : [selectedMediaItems];

    if (config?.showFeedbackModal) {
      alertSummary(files);
    }
    updateState(files);
  };

  const updateState = (mediaItems: MediaItemFile[]) => {
    const toAdd = mediaItems.filter((x) => !x.isInvalid);

    if (toAdd === undefined || toAdd.length === 0) {
      console.log('No valid media items to add', mediaItems);
    }

    const toAddPrimary = toAdd.filter((x) => x.filePriority === 'primary');
    const toAddSecondary = toAdd.filter((x) => x.filePriority === 'secondary');
    const changedMediaItemsPrimary = [...displayMediaItems, ...toAddPrimary];
    const changedMediaItemsSecondary = [...displaySecondaryMediaItems, ...toAddSecondary];

    setDisplayMediaItems(addUidToMediaItemFile(changedMediaItemsPrimary));
    setDisplaySecondaryMediaItems(addUidToMediaItemFile(changedMediaItemsSecondary));
    onChange && onChange('ADD', toAddPrimary, changedMediaItemsPrimary);
    onSecondaryChange && onSecondaryChange('ADD', toAddSecondary, changedMediaItemsSecondary);
  };

  const getMediaItemsActions = (mediaItem: MediaItemFileWithMandatoryUid) => {
    const toBeDeleted = mediaItem?.settings?.toBeDeleted ?? false;
    if (toBeDeleted) {
      return [];
    }

    const mediaItemActions: GalleryMediaItemAction[] = [
      {
        text: 'Preview',
        icon: IconNames.visibility,
        callback: (img: MediaItemFile) => {
          const activeMediaItems = displayMediaItems.filter(
            (mediaItem) => !(mediaItem?.settings?.toBeDeleted ?? false),
          );
          ModalService.openPhotoGalleryModal(activeMediaItems, img);
        },
      },
    ];
    if (editMode) {
      mediaItemActions.push({
        text: 'Delete',
        icon: IconNames.trash,
        callback: deleteMediaItem,
      });
    }

    if (canDownload) {
      mediaItemActions.push({
        text: 'Download',
        disabled: downloading,
        icon: (
          <Icon className={`${downloading ? 'loader-spinner' : ''}`} color={'--n100'}>
            {downloading ? IconNames.save : IconNames.download}
          </Icon>
        ),
        callback: downloadCallback ?? downloadMediaItem,
      });
    }

    return mediaItemActions;
  };

  /**
   * Popup Messages
   */
  const alertOneError = (text: string, replacements?: TextReplacements) => {
    switch (alertType) {
      case 'inline':
        setInlineAlert({ ...inlineAlert, title: text, description: '', replacements, type: 'danger' });
        break;
      case 'snackbar':
        snackbarService.openErrorSnackbar({ text, replacements });
        break;
    }
  };

  const alertOneMediaItem = (mediaItems: MediaItemFile[]) => {
    if (mediaItems.length !== 1) {
      return;
    }

    const mediaItem = mediaItems[0];

    if (!mediaItem.isInvalid) {
      if (alertType === 'snackbar') {
        snackbarService.openSuccessSnackbar('The media item was successfully added to the gallery.');
      }
      return;
    }

    if (mediaItem.validationErrors?.length) {
      const { text, replacements } = mediaItem.validationErrors?.[0];

      alertOneError(text, replacements);
    }
  };

  const extractMediaItemsErrors = (mediaItems: MediaItemFile[]) => {
    const mediaItemsErrors: MediaItemsErrorsDisplay = {};
    if (!mediaItems) {
      return mediaItemsErrors;
    }

    for (const mediaItem of mediaItems) {
      if (!mediaItem.isInvalid) {
        continue;
      }

      for (const err of mediaItem.validationErrors ?? []) {
        const fileName = (mediaItem.file as File)?.name ?? '';

        if (mediaItemsErrors[err.text]) {
          if (mediaItemsErrors[err.text].mediaItemsWithErrors.includes(fileName)) {
            continue;
          }

          mediaItemsErrors[err.text].mediaItemsWithErrors.push(fileName);
        } else {
          mediaItemsErrors[err.text] = {
            mediaItemsWithErrors: [fileName],
            replacements: err.replacements,
          };
        }
      }
    }

    return mediaItemsErrors;
  };

  const alertSummary = (mediaItems: MediaItemFile[]) => {
    if (mediaItems.length === 1) {
      alertOneMediaItem(mediaItems);
      return;
    }

    const mediaItemsErrors = extractMediaItemsErrors(mediaItems);

    if (alertType === 'inline') {
      const numberOfIssues = mediaItems.filter((i) => i.isInvalid).length;

      if (numberOfIssues) {
        setInlineAlert({
          ...inlineAlert,
          title: "We have identified %no_of_issues% issue(s) with the media items you've uploaded.",
          replacements: { no_of_issues: numberOfIssues },
          description: (
            <>
              {Object.keys(mediaItemsErrors).map((errorText, idx) => {
                return (
                  <div key={idx} className={classNames(mb1)}>
                    <Text type={TextTypes.textHelp} replacements={mediaItemsErrors[errorText].replacements}>
                      {errorText}
                    </Text>
                    {mediaItemsErrors[errorText].mediaItemsWithErrors.map((error, index) => {
                      return (
                        <Text type={TextTypes.textHelp} key={index} fontWeight={FontWeights.bold}>
                          {error}
                        </Text>
                      );
                    })}
                  </div>
                );
              })}
            </>
          ),
          type: 'danger',
        });
      }
    } else {
      ModalService.open(
        <GalleryFeedbackModal mediaItems={mediaItems} mediaItemsErrors={mediaItemsErrors} close={() => {}} />,
        {
          maxWidth: '640px',
          modalPosition: 'center',
        },
      );
    }
  };

  /**
   * CASE: no data
   */
  if ((!mediaItems || mediaItems.length === 0) && !editMode) {
    return null;
  }

  /**
   * Return View
   * ---
   */
  return (
    <div className={classNames('gallery-container')}>
      <InfoBox {...inlineAlert} />

      <div className={`gallery-list ${className}`}>
        <MediaItemSelectInput
          multiple={!maxNumberOfMediaItems || maxNumberOfMediaItems > 1}
          accept={acceptTypes}
          isOpen={selectMediaItem}
          mediaItemTransformers={[imageCropperTransformer, imageCompressorTransformer]}
          mediaItemProcessors={[
            imageContentProcessor,
            imageMetadataProcessor,
            videoThumbnailProcessor,
            videoMetadataProcessor,
          ]}
          mediaItemValidators={[
            fileTypeValidator,
            imageFileSizeValidator,
            imageResolutionValidator,
            videoFileSizeValidator,
            videoDurationValidator,
            videoResolutionValidator,
          ]}
          onFilesSelected={uploadMediaItems}
          openCallback={toggleSelectMediaItem}
        />

        {displayMediaItems.map((item, index) => (
          <Popover
            position={'top'}
            key={item.uuid ?? index}
            message={
              item?.settings?.toBeDeleted
                ? 'This media item has been marked for deletion and will be removed once all directories are synced.'
                : ''
            }
          >
            <div className={classNames(dFlex, dFlexColumn, gap1)}>
              <GalleryMediaItem
                format={placeholderConfig?.format}
                mediaItem={item}
                key={item.uuid ?? index}
                actions={getMediaItemsActions(item)}
              />
              <Render if={!!item.mediaItemLabel}>
                <Text type={TextTypes.textCaption}>{item.mediaItemLabel}</Text>
              </Render>
            </div>
          </Popover>
        ))}
        <PhotoPlaceholder
          icons={addNewicons}
          format={placeholderConfig?.format}
          text={placeholderConfig?.text}
          visible={editMode && displayMediaItems.length < maxNumberOfMediaItems}
          onClick={() => {
            setInlineAlert({ ...inlineAlert, title: '', description: '' });
            toggleSelectMediaItem();
          }}
        />
      </div>
    </div>
  );
};
