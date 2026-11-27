import { NonEmptyArray } from '@helpers/array-helpers';
import { RcCropper } from '@vanguard/Cropper/Cropper';
import { ContentType, MediaItemFileType } from '@vanguard/Documents/Document.types';
import { ModalService } from '@vanguard/Modal/ModalService';
import React from 'react';

import { InternalFile } from '../MediaItemSelectInput';
import { MediaItemTransformer } from './MediaItemTransformer';

type ImageCropperTransformerProps = { options?: Cropper.Options };

/**
 * A MediaItemTransformer for cropping image MediaItems.
 * Extends the MediaItemTransformer class to provide cropping functionality using an image cropper modal.
 */
export class ImageCropperTransformer extends MediaItemTransformer {
  /**
   * Specifies the file types this transformer can handle.
   * Includes generic image types and specific formats like JPEG, JPG, and PNG.
   */
  applicableFileTypes: NonEmptyArray<MediaItemFileType> = [
    ContentType.IMAGE_ANY,
    ContentType.IMAGE_JPEG,
    ContentType.IMAGE_JPG,
    ContentType.IMAGE_PNG,
  ];

  /**
   * Optional configuration options for the image cropper.
   */
  imageCropperOptions?: Cropper.Options;

  /**
   * Determines whether the file dialog should close after cropping is completed.
   */
  // closeFileDialogAfterCrop?: boolean;

  /**
   * Internal property to store the resolve function of the transform promise.
   * Used to resolve the promise when the crop operation is completed.
   */
  private resolveTransformPromise?: (files: InternalFile[] | null) => void;

  /**
   * Constructor for the ImageCropperTransformer.
   * @param config - Configuration options for the transformer, including cropper options.
   */
  constructor(config: ImageCropperTransformerProps) {
    super();
    this.imageCropperOptions = config.options;
  }

  /**
   * Asynchronous method to transform an array of files using the image cropper modal.
   * Displays the cropper for the first file in the list and resolves with the transformed file(s) or null.
   *
   * @param files - An array of files to be transformed.
   * @returns A promise that resolves to the transformed files or null.
   */
  transform = (files: InternalFile[]): Promise<InternalFile[] | null> => {
    return new Promise((resolve) => {
      const pickedFile = files[0];
      // Every crop the modal returns (primary and secondary) comes from the same picked file.
      this.resolveTransformPromise = (croppedFiles) => {
        resolve(
          croppedFiles?.map((croppedFile) => ({
            ...croppedFile,
            originalFile: pickedFile.originalFile ?? pickedFile.file,
          })) ?? null,
        );
      };
      this.openImageCropper(pickedFile.file as File);
    });
  };

  /**
   * Function: Open Cropper
   */
  private openImageCropper = (imageFile: File) => {
    return ModalService.open(
      <RcCropper
        imageFile={imageFile}
        // closeAfterCrop={this.closeFileDialogAfterCrop}
        close={(value) => {
          if (this.resolveTransformPromise) {
            this.resolveTransformPromise(null); // Fulfill the promise
            this.resolveTransformPromise = undefined; // Clear reference
          }
        }}
        save={(imageFile) => {
          if (this.resolveTransformPromise) {
            this.resolveTransformPromise(imageFile ?? null); // Fulfill the promise
            this.resolveTransformPromise = undefined; // Clear reference
          }
        }}
        {...this.imageCropperOptions}
      />,
    );
  };
}
