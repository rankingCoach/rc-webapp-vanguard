import React from 'react';
import { animated, TransitionFn, useTransition } from 'react-spring';

import { useModalContext } from '../../ModalContext';

type TransitionPropertiesType = TransitionFn<string, { transform: string; bgOpacity: number; opacity: number }>;
export type ModalTransition = 'slide' | 'grow' | 'pop';

interface Props {
  modalsList: string[];
  animation: ModalTransition;
}

export const ModalTransition = (props: Props) => {
  const { modalsList, animation } = props;
  const { getModal, getModalOrder } = useModalContext();

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
    const order = getModalOrder(modalId);
    return (
      modalId &&
      modalComponent && (
        <animated.div
          style={{ opacity: animationProps.bgOpacity, zIndex: 1100 + order }}
          className={'modalRoot'}
        >
          <animated.div
            style={{ transform: animationProps.transform, opacity: animationProps.opacity }}
            className={'modalRoot-container'}
          >
            {modalComponent}
          </animated.div>
        </animated.div>
      )
    );
  });
};
