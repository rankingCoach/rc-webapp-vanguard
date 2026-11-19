import { act, render, waitFor } from '@test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import { ModalService } from '@vanguard/Modal/ModalService';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RcCropperProps } from '../Cropper/Cropper';
import { ContentType } from '../Documents/Document.types';
import { MediaItemSelectInput, type InternalFile } from '../FileSelect/MediaItemSelectInput';
import { MediaItemTransformer } from '../FileSelect/MediaItemTransformers/MediaItemTransformer';
import { Gallery, type MediaItemFile } from './Gallery/Gallery';

const { compress } = vi.hoisted(() => ({
  compress: vi.fn<(file: File | Blob, options: Compressor.Options) => void>(),
}));

vi.mock('compressorjs', () => ({
  default: class {
    constructor(file: File | Blob, options: Compressor.Options) {
      compress(file, options);
    }
  },
}));

// Supply the image decoder's output in jsdom. FileSelect, callbacks, transforms and Gallery validation remain real.
vi.mock('../FileSelect/MediaItemProcessors/ImageMetadataProcessor', () => ({
  ImageMetadataProcessor: class {
    async applyProcessor(files: MediaItemFile[]): Promise<MediaItemFile[]> {
      return files.map((item) => ({
        ...item,
        metadata: { ...item.metadata, imageMetadata: { width: 900, height: 900 } },
      }));
    }
  },
}));

const pick = async (host: HTMLElement, file: File) => {
  const input = host.querySelector<HTMLInputElement>('input[type="file"][data-slot="media-item-select-input"]');
  if (!input) throw new Error('Gallery did not mount its file input');
  await userEvent.upload(input, file);
  expect(input.files?.[0]).toBe(file);
};

const jpeg = (name: string, size: number) => new File([new Uint8Array(size)], name, { type: ContentType.IMAGE_JPEG });

describe('Gallery picked file identity', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    compress.mockReset();
  });

  it.each([
    { useCropper: true, useCompressor: false, route: 'cropper' },
    { useCropper: false, useCompressor: true, route: 'compressor' },
    { useCropper: true, useCompressor: true, route: 'cropper then compressor' },
  ])('publishes both files after $route', async ({ useCropper, useCompressor }) => {
    const picked = jpeg('picked.jpg', 32 * 1024);
    const cropped = jpeg('cropped.jpg', 24 * 1024);
    const compressed = jpeg('compressed.jpg', 16 * 1024);
    const cropper = vi.spyOn(ModalService, 'open').mockReturnValue('fixture-cropper');
    compress.mockImplementation((_input, options) => options.success?.(compressed));
    const onChange = vi.fn<NonNullable<React.ComponentProps<typeof Gallery>['onChange']>>();
    const { container } = render(
      <Gallery
        mediaItems={[]}
        editMode
        config={{ useCropper, useCompressor, showFeedbackModal: false }}
        onChange={onChange}
      />,
    );

    await pick(container, picked);

    if (useCropper) {
      expect(cropper).toHaveBeenCalledTimes(1);
      const { props } = cropper.mock.calls[0][0] as React.ReactElement<RcCropperProps>;
      expect(props.imageFile).toBe(picked);
      expect(onChange).not.toHaveBeenCalled();
      await act(async () => props.save([{ file: cropped, filePriority: 'primary' }]));
    } else {
      expect(cropper).not.toHaveBeenCalled();
    }

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    const [operation, [added], [all]] = onChange.mock.calls[0];
    const transformed = useCompressor ? compressed : cropped;
    expect(operation).toBe('ADD');
    expect(added.originalFile).toBe(picked);
    expect(added.file).toBe(transformed);
    expect(added.file).not.toBe(added.originalFile);
    expect(all.originalFile).toBe(picked);
    expect(all.file).toBe(transformed);

    if (useCompressor) {
      expect(compress).toHaveBeenCalledTimes(1);
      expect(compress.mock.calls[0][0]).toBe(useCropper ? cropped : picked);
    } else {
      expect(compress).not.toHaveBeenCalled();
    }
  });

  it('uses the transformed file for both fields when a custom transformer drops the picked file', async () => {
    const picked = jpeg('picked.jpg', 32 * 1024);
    const transformed = jpeg('custom.jpg', 20 * 1024);
    class CustomTransformer extends MediaItemTransformer {
      applicableFileTypes: [ContentType] = [ContentType.IMAGE_JPEG];
      transform = async (files: InternalFile[]) =>
        files.map(({ filePriority }) => ({ file: transformed, filePriority }));
    }
    const onFilesSelected = vi.fn<(files: MediaItemFile[]) => void>();
    const { container } = render(
      <MediaItemSelectInput
        isOpen={false}
        openCallback={() => {}}
        mediaItemTransformers={[new CustomTransformer()]}
        onFilesSelected={onFilesSelected}
      />,
    );
    await pick(container, picked);
    await waitFor(() => expect(onFilesSelected).toHaveBeenCalledTimes(1));
    const [[items]] = onFilesSelected.mock.calls;
    expect(items[0].file).toBe(transformed);
    expect(items[0].originalFile).toBe(items[0].file);
  });
});
