import { NonEmptyArray } from '@helpers/array-helpers';
import { ContentType, MediaItemFileType } from '@vanguard/Documents/Document.types';
import { MediaItemFile } from '@vanguard/Gallery/Gallery/Gallery';

import { MediaItemProcessor } from './MediaItemProcessor';

export class DocumentContentProcessor extends MediaItemProcessor {
  applicableFileTypes: NonEmptyArray<MediaItemFileType> = [ContentType.APPLICATION_PDF];

  process = (mediaItems: MediaItemFile[]): Promise<MediaItemFile[] | null> => {
    return new Promise(async (resolve) => {
      const processedMediaItems: MediaItemFile[] = [];

      for (const mediaItem of mediaItems) {
        const { file } = mediaItem;

        if (!file || (mediaItem.fileType && !this.applicableFileTypes.includes(mediaItem.fileType))) {
          processedMediaItems.push(mediaItem);
          continue;
        }

        const content = await this.readFileAsDataURL(file);

        processedMediaItems.push({
          ...mediaItem,
          mediaItemContent: {
            base64EncodedContent: content,
            objectType: 'DocumentContent',
          },
        });
      }

      resolve(processedMediaItems);
    });
  };

  private readFileAsDataURL = (file: File | Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  };
}
