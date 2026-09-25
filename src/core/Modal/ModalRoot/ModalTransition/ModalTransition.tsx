import { translationService } from '@services/translation.service';
import { modalLayoutCss, modalStackStep, modalStackDepth } from '../../modal-layout';
import React, { useSyncExternalStore } from 'react';
import { compactWindowLayout, CompactWindowControls } from '../CompactWindowControls';
import { ModalService } from '../../ModalService';
import { Text } from '@vanguard/Text/Text';
import { animated, TransitionFn, useTransition } from 'react-spring';

import { useModalContext } from '../../ModalContext';
import { ModalPresentation } from './ModalPresentation';
import { classNames } from '@helpers/classNames';
import { useGetModals } from '../use-get-modals';

type TransitionPropertiesType = TransitionFn<string, { transform: string; bgOpacity: number; opacity: number }>;
export type ModalTransition = 'slide' | 'grow' | 'pop';

interface Props {
  modalsList: string[];
  animation: ModalTransition;
}

export const ModalTransition = (props: Props) => {
  const { modalsList, animation } = props;
  useSyncExternalStore(ModalService.subscribePresentation, ModalService.getPresentationRevision, ModalService.getPresentationRevision);
  const { getModal, getModalZIndex, modalRootState } = useModalContext();
  // Keep browser-style tabs stable, independent of the overlay order.
  const visibleIds = Object.values(useGetModals(modalRootState)).flat();
  const expandedIds = ModalService.getBamIds().filter((id) => visibleIds.includes(id) && !getModal(id)?.isCompact);
  const tabbed = ModalService.isStackingEnabled() && expandedIds.length > 3;
  const tabIds = tabbed ? visibleIds.filter((id) => expandedIds.includes(id)) : [];
  const activeTabId = expandedIds.at(-1);

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
  return <>{transition((animationProps, modalId: string) => {
    const modalComponent = getModal(modalId);
    const zIndex = getModalZIndex(modalId);
    const bamIds = ModalService.getStackedBamIds(modalId);
    const index = bamIds.indexOf(modalId);
    const stacked = ModalService.isStackingEnabled() && index >= 0 && bamIds.length > 1;
    const active = !stacked || index === bamIds.length - 1;
    const compact = !!modalComponent?.isCompact;
    const hasTabs = tabbed && tabIds.includes(modalId);
    const windowControls = ModalService.isCompactWindowControlsEnabled() && compact && !!modalComponent?.isFullscreen;
    const layout = windowControls ? compactWindowLayout(modalId, index, bamIds.length, stacked) : undefined;
    const windowStyle = layout ? {
      '--compact-window-x': `${layout.panel.x}px`, '--compact-window-y': `${layout.panel.y}px`,
      '--compact-window-width': `${layout.panel.width}px`, '--compact-window-height': `${layout.panel.height}px`,
    } : {};
    const step = modalStackStep(bamIds.length);
    const stackStyle = stacked ? {
      '--modal-stack-offset': `${index * step}px`,
      '--modal-stack-depth': `${modalStackDepth(index, bamIds.length)}px`,
      '--modal-stack-tab-height': `${step}px`,
      backgroundColor: index > 0 || compact ? 'transparent' : undefined,
    } : {};
    const title = modalComponent?.props.stackTitle || (typeof modalComponent?.props.title === 'string' ? modalComponent.props.title : translationService.get('Window').value);
    return (
      modalId &&
      modalComponent && (
        <animated.div
          style={{ opacity: animationProps.bgOpacity, zIndex, ...modalLayoutCss, ...stackStyle, ...windowStyle }}
          data-modal-id={modalId}
          data-stack-active={stacked ? active : undefined}
          className={classNames('modalRoot',
            compact ? 'modalRoot-compact' : '',
            stacked ? 'modalRoot-stacked' : '',
            hasTabs ? 'modalRoot-tabbed' : '',
            stacked && !active ? 'modalRoot-stack-back' : '',
            windowControls ? 'modalRoot-window-controls' : '',
            windowControls && ModalService.isCompactWindowInteracting() ? 'modalRoot-window-interacting' : '')}
          onPointerDownCapture={windowControls && active ? () => ModalService.focusCompactWindow(modalId) : undefined}
        >
          {windowControls && <div className="compact-window-drop-preview" aria-hidden="true" />}
          {windowControls && <CompactWindowControls id={modalId} title={title} index={index} count={bamIds.length} stacked={stacked} active={active} />}
          {stacked && !active && !hasTabs && (
            <button className="modal-stack-activate" onClick={() => ModalService.bringToFront(modalId)}>
              <Text replacements={{ title }}>Bring to front %title%</Text>
            </button>
          )}
          <animated.div
            id={hasTabs ? `bam-panel-${modalId}` : undefined}
            role={hasTabs ? 'tabpanel' : undefined}
            aria-labelledby={hasTabs ? `bam-tab-${modalId}` : undefined}
            inert={stacked && !active ? true : undefined}
            style={{ transform: animationProps.transform, opacity: animationProps.opacity }}
            className={'modalRoot-container'}
          >
            <ModalPresentation
              allowCompact={!!modalComponent.props.allowCompact || !!modalComponent.compactManaged}
              isCompact={compact} modalId={modalId} stacked={stacked} active={active}>
              {modalComponent}
            </ModalPresentation>
          </animated.div>
        </animated.div>
      )
    );
  })}
    {animation === 'grow' && tabbed && activeTabId && <div className="modal-stack-tabs" role="tablist" aria-label={translationService.get('Open windows').value}
      style={{ ...modalLayoutCss, zIndex: getModalZIndex(activeTabId) } as React.CSSProperties}>
      {tabIds.map((id, tabIndex) => {
        const modal = getModal(id);
        const label = modal?.props.stackTitle || (typeof modal?.props.title === 'string' ? modal.props.title : translationService.get('Window').value);
        return <button key={id} id={`bam-tab-${id}`} type="button" role="tab"
          style={{ '--modal-tab-delay': `${40 + Math.min(tabIndex, 5) * 25}ms` } as React.CSSProperties}
          aria-selected={id === activeTabId} aria-controls={`bam-panel-${id}`}
          tabIndex={id === activeTabId ? 0 : -1} title={label}
          onClick={() => ModalService.bringToFront(id)}
          onFocus={(event) => event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })}
          onKeyDown={(event) => {
            const index = tabIds.indexOf(id);
            const next = event.key === 'ArrowRight' ? (index + 1) % tabIds.length
              : event.key === 'ArrowLeft' ? (index + tabIds.length - 1) % tabIds.length
              : event.key === 'Home' ? 0 : event.key === 'End' ? tabIds.length - 1 : -1;
            if (next < 0) return;
            event.preventDefault();
            ModalService.bringToFront(tabIds[next]);
            event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
          }}><Text translate={false}>{label}</Text></button>;
      })}
    </div>}
  </>;
};
