import React, { useSyncExternalStore } from 'react';
import { ModalService } from '../../ModalService';
import { Text } from '@vanguard/Text/Text';
import { animated, TransitionFn, useTransition } from 'react-spring';

import { useModalContext } from '../../ModalContext';
import { ModalPresentationContext } from '../../ModalPresentationContext';

type TransitionPropertiesType = TransitionFn<string, { transform: string; bgOpacity: number; opacity: number }>;
export type ModalTransition = 'slide' | 'grow' | 'pop';

interface Props {
  modalsList: string[];
  animation: ModalTransition;
}

export const ModalTransition = (props: Props) => {
  const { modalsList, animation } = props;
  useSyncExternalStore(ModalService.subscribePresentation, ModalService.getPresentationRevision, ModalService.getPresentationRevision);
  const bamIds = ModalService.getBamIds();
  const { getModal, getModalZIndex } = useModalContext();

  let transition: TransitionPropertiesType;
  let animationDuration: number;

  /**
   * Choose animation
   */
  switch (animation) {
    case 'slide':
      animationDuration = 400;
      transition = useTransition(modalsList, {
        from: { transform: 'translate3d(100vw, 0, 0)', opacity: 1, bgOpacity: 0 },
        enter: [
          { opacity: 1, transform: 'translate3d(0vw, 0, 0)', bgOpacity: 1 },
          { transform: 'none', immediate: true },
        ],
        leave: [
          { opacity: 1, transform: 'translate3d(0vw, 0, 0)', immediate: true },
          { opacity: 1, transform: 'translate3d(100vw, 0, 0)', bgOpacity: 0 },
        ],
        config: { duration: animationDuration, mass: 1, tension: 120, friction: 20 },
      });
      break;
    case 'pop':
      animationDuration = 250;
      transition = useTransition(modalsList, {
        from: { opacity: 0.5, transform: 'translate3d(0, +15vh, 0)', bgOpacity: 0 },
        enter: [
          { opacity: 1, transform: 'translate3d(0, 0vh, 0)', bgOpacity: 1 },
          { transform: 'none', immediate: true },
        ],
        leave: [
          { opacity: 1, transform: 'translate3d(0, 0vh, 0)', immediate: true },
          { opacity: 0, transform: 'translate3d(0, -15vh, 0)', bgOpacity: 0 },
        ],
        config: { duration: animationDuration, mass: 1, tension: 120, friction: 20 },
      });
      break;
    default:
    case 'grow':
      animationDuration = 250;
      transition = useTransition(modalsList, {
        from: { opacity: 0.5, transform: 'translate3d(0, -15vh, 0)', bgOpacity: 0 },
        enter: [
          { opacity: 1, transform: 'translate3d(0, 0vh, 0)', bgOpacity: 1 },
          { transform: 'none', immediate: true },
        ],
        leave: [
          { opacity: 1, transform: 'translate3d(0, 0vh, 0)', immediate: true },
          { opacity: 0, transform: 'translate3d(0, -15vh, 0)', bgOpacity: 0 },
        ],
        config: { duration: animationDuration, mass: 1, tension: 120, friction: 20 },
      });
  }

  /**
   * Return Animated Modal
   * -------------------------------------------------------------------------------------------------------------------
   */
  return transition((animationProps, modalId: string) => {
    const modalComponent = getModal(modalId);
    const zIndex = getModalZIndex(modalId);
    const index = bamIds.indexOf(modalId);
    const stacked = ModalService.isStackingEnabled() && index >= 0 && bamIds.length > 1;
    const active = !stacked || index === bamIds.length - 1;
    const compact = !!modalComponent?.isCompact;
    const step = Math.min(28, 140 / Math.max(1, bamIds.length - 1));
    const stackStyle = stacked ? {
      '--modal-stack-offset': `${index * step}px`,
      '--modal-stack-depth': `${Math.min(4, bamIds.length - 1 - index) * 10}px`,
      '--modal-stack-tab-height': `${step}px`,
      backgroundColor: index > 0 || compact ? 'transparent' : undefined,
    } : {};
    const title = modalComponent?.props.stackTitle || (typeof modalComponent?.props.title === 'string' ? modalComponent.props.title : 'window');
    return (
      modalId &&
      modalComponent && (
        <animated.div
          style={{ opacity: animationProps.bgOpacity, zIndex, ...stackStyle } as any}
          data-modal-id={modalId}
          data-stack-active={stacked ? active : undefined}
          className={`modalRoot${compact ? ' modalRoot-compact' : ''}${stacked ? ' modalRoot-stacked' : ''}${stacked && !active ? ' modalRoot-stack-back' : ''}`}
        >
          {stacked && !active && (
            <button className="modal-stack-activate" onClick={() => ModalService.bringToFront(modalId)}>
              <Text replacements={{ title }}>Bring to front %title%</Text>
            </button>
          )}
          <animated.div
            inert={stacked && !active ? true : undefined}
            style={{ transform: animationProps.transform, opacity: animationProps.opacity }}
            className={'modalRoot-container'}
          >
            <ModalPresentationContext.Provider value={{
              allowCompact: !!modalComponent.props.allowCompact || !!modalComponent.compactManaged,
              isCompact: compact,
              modalId, stacked, active,
            }}>
              {modalComponent}
            </ModalPresentationContext.Provider>
          </animated.div>
        </animated.div>
      )
    );
  });
};
