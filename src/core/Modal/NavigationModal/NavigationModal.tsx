import { useOnArrowKeyPress } from '@custom-hooks/use-on-escape-kye-press';
import { classNames } from '@helpers/classNames';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Modal, ModalProps } from '@vanguard/Modal/Modal';
import { Text } from '@vanguard/Text/Text';
import React, { useCallback } from 'react';

import styles from './NavigationModal.module.scss';

export type NavigationModalProps = Omit<ModalProps, 'outerContent'> & {
  /** 0-based index of the currently shown item. Controlled by the parent. */
  activeIndex: number;
  /** Total number of items in the collection. */
  totalItems: number;
  /** Called with the new index when the user navigates via arrows or keyboard. */
  onNavigate: (newIndex: number) => void;
  /** Wrap around at the ends. When `false` (default) arrows are disabled at the bounds. */
  loop?: boolean;
  /** Navigate with the ArrowLeft/ArrowRight keys. Defaults to `true`. */
  keyboardNavigation?: boolean;
  /** Hide the "N of M" counter below the panel. Defaults to `false`. */
  hideCounter?: boolean;
};

/**
 * Component
 * ---------------------------------------------------------------------------------------------------------------------
 * Lightbox-style modal for paging through a collection: prev/next arrows and an
 * "N of M" counter are rendered OUTSIDE the modal panel, on the overlay.
 * Navigation state is controlled by the parent, which renders the current item
 * as `children`. On mobile (fullscreen) the arrows are hidden — pair the content
 * with a swipeable component (e.g. `SlideCarousel` with `hasArrows={false}`).
 */
export const NavigationModal = (props: NavigationModalProps) => {
  const {
    activeIndex,
    totalItems,
    onNavigate,
    loop = false,
    keyboardNavigation = true,
    hideCounter = false,
    children,
    ...modalProps
  } = props;

  const canGoPrevious = loop ? totalItems > 1 : activeIndex > 0;
  const canGoNext = loop ? totalItems > 1 : activeIndex < totalItems - 1;

  const goPrevious = useCallback(() => {
    if (!canGoPrevious) {
      return;
    }
    onNavigate(activeIndex === 0 ? totalItems - 1 : activeIndex - 1);
  }, [canGoPrevious, activeIndex, totalItems, onNavigate]);

  const goNext = useCallback(() => {
    if (!canGoNext) {
      return;
    }
    onNavigate(activeIndex === totalItems - 1 ? 0 : activeIndex + 1);
  }, [canGoNext, activeIndex, totalItems, onNavigate]);

  useOnArrowKeyPress(
    useCallback((e: KeyboardEvent) => (e.key === 'ArrowLeft' ? goPrevious() : goNext()), [goPrevious, goNext]),
    keyboardNavigation,
  );

  const showArrows = totalItems > 1;

  const outerContent = (
    <>
      {showArrows ? (
        <div className={classNames(styles.arrow, styles.arrowLeft)}>
          <Button
            testId={'navigation-modal-prev'}
            type={ButtonTypes.muted}
            size={ButtonSizes.large}
            // The caret SVG assets are mirror-named: caretRight points left (same swap as SlideCarousel's Arrow)
            icon={IconNames.caretRight}
            rounded
            inverted
            disabled={!canGoPrevious}
            onClick={goPrevious}
          />
        </div>
      ) : null}
      {showArrows ? (
        <div className={classNames(styles.arrow, styles.arrowRight)}>
          <Button
            testId={'navigation-modal-next'}
            type={ButtonTypes.muted}
            size={ButtonSizes.large}
            icon={IconNames.caretLeft}
            rounded
            inverted
            disabled={!canGoNext}
            onClick={goNext}
          />
        </div>
      ) : null}
      {!hideCounter && totalItems > 0 ? (
        <div className={styles.counter} data-testid={'navigation-modal-counter'}>
          <Text color={'--fn-fg-lightest'} replacements={{ current: activeIndex + 1, total: totalItems }}>
            {'%current% of %total%'}
          </Text>
        </div>
      ) : null}
    </>
  );

  return (
    <Modal modalPosition={'center'} {...modalProps} outerContent={outerContent}>
      {children}
    </Modal>
  );
};
