import { NonEmptyArray } from '@helpers/array-helpers';
import { ContentType, MediaItemFileType } from '@vanguard/Documents/Document.types';
import { MediaItemFile } from '@vanguard/Gallery/Gallery/Gallery';

import { MediaItemProcessor } from './MediaItemProcessor';

/** The backend's `objectType` for an uploaded media item's content. */
const MEDIA_ITEM_CONTENT_OBJECT_TYPE =
  'App\\Domain\\Presence\\Entities\\Locations\\MediaItems\\LocationMediaItemContent';

type ImageContentProcessorProps = {};

export class ImageContentProcessor extends MediaItemProcessor {
  applicableFileTypes: NonEmptyArray<MediaItemFileType> = [
    ContentType.IMAGE_ANY,
    ContentType.IMAGE_JPEG,
    ContentType.IMAGE_JPG,
    ContentType.IMAGE_PNG,
  ];

  private resolveProcessorPromise?: (files: MediaItemFile[] | null) => void;

  constructor(config: ImageContentProcessorProps) {
    super();
  }

  process = (mediaItems: MediaItemFile[]): Promise<MediaItemFile[] | null> => {
    return new Promise((resolve) => {
      this.resolveProcessorPromise = resolve;
      this.extractContentForMediaItems(mediaItems);
    });
  };

  private extractContentForMediaItems = async (mediaItems: MediaItemFile[]) => {
    const processedMediaItems: MediaItemFile[] = [];

    for (const mediaItem of mediaItems) {
      const { file } = mediaItem;

      if (!file || (mediaItem.fileType && !this.applicableFileTypes.includes(mediaItem.fileType))) {
        processedMediaItems.push(mediaItem);
        continue;
      }

      const imageContent = await this.extractImageContent(file);

      if (!imageContent) {
        processedMediaItems.push(mediaItem);
        continue;
      }

      processedMediaItems.push({
        ...mediaItem,
        mediaItemContent: {
          base64EncodedContent: imageContent,
          objectType: MEDIA_ITEM_CONTENT_OBJECT_TYPE,
        },
      });
    }

    this.resolveProcessorPromise?.(processedMediaItems);
    this.resolveProcessorPromise = undefined;
  };

  private arrayBufferToBase64 = (buffer: ArrayBuffer | string): string => {
    if (typeof buffer === 'string') {
      return buffer;
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  private extractImageContent = async (imageFile: File | Blob): Promise<string> => {
    const self = this;

    return new Promise((resolve, reject) => {
      const filerReader = new FileReader();
      filerReader.onload = function () {
        if (filerReader.result) {
          resolve(self.arrayBufferToBase64(filerReader.result));
        }
      };

      if (imageFile) {
        filerReader.readAsDataURL(imageFile);
      }
    });
  };
}
