import { render } from '@test-utils/test-utils';
import { useLazyImage } from '@custom-hooks/useLazyImage';
import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Gallery } from './Gallery/Gallery';
import { GalleryMediaItem } from './Gallery/GalleryMediaItem/GalleryMediaItem';
import { PhotoPlaceholder } from './Gallery/PhotoPlaceholder/PhotoPlaceholder';
import { GalleryFeedbackModal } from './Gallery/GalleryFeedbackModal/GalleryFeedbackModal';
import { ErrorImagesList } from './Gallery/GalleryFeedbackModal/ErrorImagesList/ErrorImagesList';

vi.mock('@custom-hooks/useLazyImage', () => ({ useLazyImage: vi.fn() }));

const mediaItem = { objectType: 'MediaItemFile', publicUrl: '/image.png', type: 'video' };
const errors = { 'Invalid image': { mediaItemsWithErrors: ['image.png'] } };
const loadedImage = {
  isLazyLoading: false,
  isLazyError: false,
  setIsLazyLoading: vi.fn(),
  setIsLazyError: vi.fn(),
};

describe('Gallery data-slot contract', () => {
  it('slots the gallery consumer root, container and item wrapper', () => {
    vi.mocked(useLazyImage).mockReturnValue(loadedImage);
    const { container } = render(<Gallery mediaItems={[mediaItem]} editMode={false} className={'mine'} />);
    expect(container.querySelector('[data-slot="gallery"]')?.classList.contains('mine')).toBe(true);
    for (const slot of ['gallery', 'gallery-container', 'gallery-item']) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe('DIV');
    }
  });

  it('slots media parts and tracks selected and disabled classes', () => {
    vi.mocked(useLazyImage).mockReturnValue(loadedImage);
    const { container, rerender } = render(<GalleryMediaItem mediaItem={mediaItem} selectable isSelected={false} />);
    for (const slot of ['gallery-media-item-container', 'gallery-media-item', 'gallery-media-item-options', 'gallery-media-item-video-metadata']) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe('DIV');
    }
    const options = () => container.querySelector('[data-slot="gallery-media-item-options"]')!;
    expect(options().hasAttribute('data-selected')).toBe(false);
    rerender(<GalleryMediaItem mediaItem={mediaItem} selectable isSelected />);
    expect(options().getAttribute('data-selected')).toBe('');
    const action = { callback: vi.fn(), text: 'Download', icon: IconNames.download };
    rerender(<GalleryMediaItem mediaItem={mediaItem} actions={[action]} />);
    expect(options().hasAttribute('data-selected')).toBe(false);
    const actionElement = () => container.querySelector('[data-slot="gallery-media-item-action"]')!;
    expect(actionElement().tagName).toBe('DIV');
    expect(actionElement().hasAttribute('data-disabled')).toBe(false);
    rerender(<GalleryMediaItem mediaItem={mediaItem} actions={[{ ...action, disabled: true }]} />);
    expect(actionElement().getAttribute('data-disabled')).toBe('');
    rerender(<GalleryMediaItem mediaItem={mediaItem} actions={[action]} />);
    expect(actionElement().hasAttribute('data-disabled')).toBe(false);
  });

  it('slots the loading media container without annotating Skeleton', () => {
    vi.mocked(useLazyImage).mockReturnValue({ ...loadedImage, isLazyLoading: true });
    const { container } = render(<GalleryMediaItem mediaItem={mediaItem} />);
    expect(container.querySelector('[data-slot="gallery-media-item-container"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="gallery-media-item"]')).toBeNull();
  });

  it('slots the placeholder and icon group and tracks format classes', () => {
    const { container, rerender } = render(<PhotoPlaceholder visible icons={[IconNames.image, IconNames.media]} />);
    const root = () => container.querySelector('[data-slot="photo-placeholder"]')!;
    expect(root().tagName).toBe('DIV');
    expect(root().classList.contains('PhotoPlaceholder-container')).toBe(true);
    expect(root().getAttribute('data-variant')).toBe('square');
    expect(container.querySelector('[data-slot="photo-placeholder-icons"]')?.tagName).toBe('DIV');
    rerender(<PhotoPlaceholder visible format={'wide'} />);
    expect(root().getAttribute('data-variant')).toBe('wide');
  });

  it('slots error summaries and groups', () => {
    const { container } = render(<ErrorImagesList mediaItemsErrors={errors} validMediaItemsCount={0} invalidMediaItemsCount={1} />);
    for (const slot of ['error-images-list', 'error-images-list-summary', 'error-images-list-error']) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe('DIV');
    }
  });

  it('slots feedback body and success summary without annotating Modal', () => {
    const { container } = render(<GalleryFeedbackModal close={() => {}} mediaItems={[mediaItem]} mediaItemsErrors={errors} />);
    for (const slot of ['gallery-feedback-modal-body', 'gallery-feedback-modal-success']) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe('DIV');
    }
    expect(container.querySelector('[data-slot="gallery-feedback-modal"]')).toBeNull();
  });
});
