import { CONTENT_TYPE_IMAGE_ANY, ContentType } from '@vanguard/Documents/Document.types';
import { MediaItemFile } from '@vanguard/Gallery/Gallery/Gallery';
import React, { ChangeEvent, useEffect, useRef } from 'react';

import { MediaItemProcessor } from './MediaItemProcessors/MediaItemProcessor';
import { MediaItemTransformer } from './MediaItemTransformers/MediaItemTransformer';
import { MediaItemValidator } from './MediaItemValidators/MediaItemValidator';

export type FilePriority = 'primary' | 'secondary';

export type InternalFile = {
  file: File | Blob;
  filePriority: FilePriority;
};

type Props = {
  isOpen: boolean; //@todo replace with anchorEl
  openCallback: () => void;
  accept?: ContentType[];

  onFilesSelected: (selectedFiles: MediaItemFile[]) => void;

  mediaItemTransformers?: Array<MediaItemTransformer | null>;
  mediaItemProcessors?: Array<MediaItemProcessor | null>;
  mediaItemValidators?: Array<MediaItemValidator | null>;

  multiple?: boolean;
};

export const MediaItemSelectInput = (props: Props) => {
  const {
    isOpen,
    openCallback,
    onFilesSelected,
    accept = [CONTENT_TYPE_IMAGE_ANY],
    multiple = false,
    mediaItemTransformers = [],
    mediaItemProcessors = [],
    mediaItemValidators = [],
  } = props;

  const fileSelectRef = useRef<HTMLInputElement>(null);

  /**
   * Effect: Open File Select
   */
  useEffect(() => {
    if (isOpen && fileSelectRef.current) {
      fileSelectRef.current.value = '';
      fileSelectRef.current.click();
      openCallback();
    }
  }, [isOpen]);

  /**
   * Function: On File Input Change
   */
  const inputOnChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const addTypeNonNull = (file: File): InternalFile => {
      return {
        file: file,
        filePriority: 'primary',
      };
    };

    const selectedFiles = Array.from(event.target.files ? event.target.files : []);

    if (!selectedFiles.length) {
      return;
    }

    let files: InternalFile[] | null = selectedFiles.map(addTypeNonNull);

    if (mediaItemTransformers.length) {
      for (const mediaItemTransformer of mediaItemTransformers) {
        if (files && mediaItemTransformer) {
          files = await mediaItemTransformer.applyTransformer(files);
        }
      }
    }

    if (!files) {
      selectFiles(null);
      return;
    }

    let mediaItems: MediaItemFile[] | null = convertToMediaItemFile(files);

    if (mediaItemProcessors.length) {
      for (const mediaItemProcessor of mediaItemProcessors) {
        if (mediaItems && mediaItemProcessor) {
          mediaItems = await mediaItemProcessor.applyProcessor(mediaItems);
        }
      }
    }

    if (!mediaItems) {
      selectFiles(null);
      return;
    }

    if (mediaItemValidators.length) {
      for (const mediaItemValidator of mediaItemValidators) {
        if (mediaItems && mediaItemValidator) {
          mediaItems = await mediaItemValidator.applyValidator(mediaItems);
        }
      }
    }

    selectFiles(mediaItems);
  };

  const convertToMediaItemFile = (files: InternalFile[]): MediaItemFile[] => {
    const mediaItems = files.map((internalFile) => {
      const { file, filePriority } = internalFile;

      return {
        file: file,
        filePriority: filePriority,
        fileType: file.type,
        name: file instanceof File ? file.name : 'blob',
        size: file.size,
        lastModified: file instanceof File ? file.lastModified : Date.now(),
        objectType: 'MediaItemFile',
      } as MediaItemFile;
    });

    return mediaItems;
  };

  /**
   * Function: Select Files
   */
  const selectFiles = (selectedFiles: MediaItemFile[] | null) => {
    if (!selectedFiles) {
      return;
    }

    onFilesSelected(selectedFiles);
  };

  /**
   * Render View
   */
  return (
    <input
      data-slot={'media-item-select-input'}
      ref={fileSelectRef}
      type={'file'}
      accept={accept.join(',')}
      onChange={inputOnChange}
      style={{ display: 'none' }}
      multiple={multiple}
    />
  );
};
