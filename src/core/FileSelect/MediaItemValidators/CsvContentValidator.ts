import { NonEmptyArray } from '@helpers/array-helpers';
import { ContentType, MediaItemFileType } from '@vanguard/Documents/Document.types';
import { MediaItemFile } from '@vanguard/Gallery/Gallery/Gallery';

import { MediaItemValidator } from './MediaItemValidator';

type CsvContentValidatorProps = {
  requiredHeaders: string[];
};

export class CsvContentValidator extends MediaItemValidator {
  applicableFileTypes: NonEmptyArray<MediaItemFileType> = [ContentType.TEXT_CSV];

  private requiredHeaders: string[];

  constructor({ requiredHeaders }: CsvContentValidatorProps) {
    super();
    this.requiredHeaders = requiredHeaders;
  }

  validate = (files: MediaItemFile[]): Promise<MediaItemFile[] | null> => {
    return Promise.all(files.map((mediaItem) => this.validateMediaItem(mediaItem)));
  };

  private validateMediaItem = async (mediaItem: MediaItemFile): Promise<MediaItemFile> => {
    mediaItem.isInvalid = mediaItem.isInvalid ?? false;
    mediaItem.validationErrors = mediaItem.validationErrors ?? [];

    const { file } = mediaItem;
    if (!file) return mediaItem;

    const text = await (file as File).text();
    const firstLine = text.split(/\r?\n/)[0] ?? '';
    const presentHeaders = firstLine.split(',').map((h) => h.trim().toLowerCase());

    const missingHeaders = this.requiredHeaders.filter(
      (required) => !presentHeaders.includes(required.toLowerCase()),
    );

    if (missingHeaders.length > 0) {
      mediaItem.isInvalid = true;
      mediaItem.validationErrors.push({
        text: `The CSV is missing required columns: <b>${missingHeaders.join(', ')}</b>.`,
      });
    }

    return mediaItem;
  };
}
