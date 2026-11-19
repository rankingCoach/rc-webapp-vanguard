import { NonEmptyArray } from '@helpers/array-helpers';
import { ContentType, MediaItemFileType } from '@vanguard/Documents/Document.types';
import { ModalService } from '@vanguard/Modal/ModalService';
import Compressor from 'compressorjs';

import { InternalFile } from '../MediaItemSelectInput';
import { MediaItemTransformer } from './MediaItemTransformer';

type ImageCompressorTransformerProps = {
  compressorOptions: Compressor.Options;
  showLoadingModalDuringCompression?: boolean;
};

/**
 * Class responsible for compressing image files.
 *
 * @extends MediaItemTransformer
 */
export class ImageCompressorTransformer extends MediaItemTransformer {
  /**
   * List of applicable file types for compression.
   */
  applicableFileTypes: NonEmptyArray<MediaItemFileType> = [
    ContentType.IMAGE_ANY,
    ContentType.IMAGE_JPEG,
    ContentType.IMAGE_JPG,
    ContentType.IMAGE_PNG,
  ];

  /**
   * Promise resolver for the transform method.
   * @private
   */
  private resolveTransformPromise?: (files: InternalFile[] | null) => void;

  /**
   * Options for the compressor.
   * @private
   */
  private compressorOptions: Compressor.Options;

  /**
   * Flag to show loading modal during compression.
   * @private
   */
  private showLoadingModalDuringCompression: boolean;

  /**
   * Constructor for ImageCompressorTransformer.
   *
   * @param config - Configuration options for the transformer.
   */
  constructor(config: ImageCompressorTransformerProps) {
    super();
    this.compressorOptions = config.compressorOptions;
    this.showLoadingModalDuringCompression = config.showLoadingModalDuringCompression ?? false;
  }

  /**
   * Transforms the given files by compressing them.
   *
   * @param files - Array of files to be compressed.
   * @returns A promise that resolves with the compressed files or null.
   */
  transform = (files: InternalFile[]): Promise<InternalFile[] | null> => {
    return new Promise((resolve) => {
      this.resolveTransformPromise = resolve;
      this.compress(files);
    });
  };

  /**
   * Compresses the given files.
   *
   * @param files - Array of files to be compressed.
   * @private
   */
  private compress = (files: InternalFile[]) => {
    if (this.showLoadingModalDuringCompression) {
      ModalService.openLoadingModal();
    }

    if (files.length === 1) {
      this.compressSingleFile(files[0]);
    } else {
      this.compressMultipeFiles(files);
    }
  };

  /**
   * The file as picked: what the input recorded, or the incoming file when this transformer is
   * used on its own.
   *
   * @private
   */
  private getOriginalFile = (internalFile: InternalFile): File | Blob => {
    return internalFile.originalFile ?? internalFile.file;
  };

  /**
   * Compresses a single file.
   *
   * @param selectedFile - The file to be compressed.
   * @private
   */
  private compressSingleFile = (selectedFile: InternalFile) => {
    const t0 = performance.now();

    this.compressorOptions.success = (compressedResult) => {
      this.handleLoadingModalClose(t0);

      this.resolveTransformPromise?.([
        {
          file: compressedResult,
          filePriority: selectedFile.filePriority,
          originalFile: this.getOriginalFile(selectedFile),
        },
      ]);
      this.resolveTransformPromise = undefined;
    };

    new Compressor(selectedFile.file, this.compressorOptions);
  };

  /**
   * Compresses multiple files.
   *
   * @param selectedFiles - Array of files to be compressed.
   * @private
   */
  private compressMultipeFiles = (selectedFiles: InternalFile[]) => {
    const t0 = performance.now();

    const promises = [];
    for (const internalFile of selectedFiles) {
      promises.push(
        new Promise<InternalFile>((resolve, reject) => {
          if (
            !internalFile.file ||
            (internalFile.file.type && !this.applicableFileTypes.includes(internalFile.file.type as MediaItemFileType))
          ) {
            resolve(internalFile);
          }

          // If we need to compress only one image it is easy
          this.compressorOptions.success = (compressedResult) => {
            resolve({
              file: compressedResult,
              filePriority: internalFile.filePriority,
              originalFile: this.getOriginalFile(internalFile),
            });
          };

          this.compressorOptions.error = (err) => {
            reject(err);
          };

          new Compressor(internalFile.file, this.compressorOptions);
        }),
      );
    }

    Promise.all(promises).then((imageFiles: InternalFile[]) => {
      this.handleLoadingModalClose(t0);

      this.resolveTransformPromise?.(imageFiles);
      this.resolveTransformPromise = undefined;
    });
  };

  /**
   * Handles the closing of the loading modal after compression.
   *
   * @param t0 - The timestamp when the compression started.
   *
   * This function calculates the duration of the compression process and determines
   * an appropriate timeout before closing the loading modal. The timeout is used to
   * ensure that the modal is visible for a minimum amount of time, even if the
   * compression process is very fast.
   *
   * Timeout logic:
   * - If the duration is less than or equal to 500ms, the timeout is set to 1500ms.
   * - If the duration is less than or equal to 1000ms, the timeout is set to 1000ms.
   * - If the duration is less than or equal to 1500ms, the timeout is set to 500ms.
   * - If the duration is less than or equal to 2000ms, the timeout is set to 0ms.
   *
   * After the calculated timeout, the loading modal is closed using the ModalService.
   */
  private handleLoadingModalClose = (t0: number) => {
    if (this.showLoadingModalDuringCompression) {
      const t1 = performance.now();
      const duration = t1 - t0;
      let timeout = 1500;
      if (t1 - t0 <= 500) {
        timeout = 1500;
      } else if (duration <= 1000) {
        timeout = 1000;
      } else if (duration <= 1500) {
        timeout = 500;
      } else if (duration <= 2000) {
        timeout = 0;
      }
      // We use a timeout if the modal closes too fast
      setTimeout(() => {
        ModalService.closeLoadingModal();
      }, timeout);
    }
  };
}
