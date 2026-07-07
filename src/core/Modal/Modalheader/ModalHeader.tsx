import './ModalHeader.scss';

import { classNames } from '@helpers/classNames';
import { AnimatedConditional } from '@vanguard/AnimatedConditional/AnimatedConditional';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { FontWeights, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React, { useCallback } from 'react';

import { IconNames } from '../../Icon/IconNames';
import { ModalResponse } from '../ModalResponse';

export type ModalType = 'danger' | 'info' | 'warn' | 'success' | 'default';

export interface ModalHeaderProps {
  type?: ModalType;
  title?: string;
  titleTextType?: TextTypes;
  children?: React.ReactNode;
  /**
   * @deprecated The close button is now managed by `<Modal>`. Pass `onClose`
   * to `<Modal>` instead of `closeFn` to `<ModalHeader>`. Kept for backwards
   * compatibility.
   */
  closeFn?: (response?: ModalResponse<any>) => void;
  className?: string;
  /**
   * @deprecated Use `<Modal hideCloseButtonOnMobile />`. The modal now owns its
   * close button. Kept for backwards compatibility.
   */
  hideCloseButtonOnMobile?: boolean;
  /**
   * @deprecated Use `<Modal showCloseButton={false} />` (or simply omit
   * `onClose`). The modal now owns its close button. Kept for backwards
   * compatibility.
   */
  hideHeaderCloseBtn?: boolean;
  hideTypeIcon?: boolean;
  replacements?: TextReplacements;
}

export const ModalHeader = (props: ModalHeaderProps) => {
  const {
    children,
    closeFn,
    className,
    type = 'default',
    hideCloseButtonOnMobile = true,
    hideHeaderCloseBtn = false,
    hideTypeIcon = false,
    title,
    titleTextType = TextTypes.heading3,
    replacements,
  } = props;

  const getHeaderData = useCallback(
    (type?: ModalType) => {
      switch (type) {
        case 'danger':
          return {
            color: '--e500',
            containerStyle: { borderTop: '2px solid var(--e500)', borderRadius: 8 },
            icon: (
              <Icon type={IconSize.small} color={'--e500'} hasCircle={true}>
                {IconNames.exclamation}
              </Icon>
            ),
          };
        case 'warn':
          return {
            color: '--w500',
            containerStyle: { borderTop: '2px solid var(--w500)', borderRadius: 8 },
            icon: (
              <Icon type={IconSize.large} color={'--w500'} hasCircle={false}>
                {IconNames.warning}
              </Icon>
            ),
          };
        case 'success':
          return {
            color: '--s500',
            containerStyle: { borderTop: '2px solid var(--s500)', borderRadius: 8 },
            icon: (
              <Icon type={IconSize.small} color={'--s500'} hasCircle={true}>
                {IconNames.check}
              </Icon>
            ),
          };
        case 'info':
          return {
            color: '--p500',
            containerStyle: { borderTop: '2px solid var(--p500)', borderRadius: 8 },
            icon: (
              <Icon type={IconSize.small} color={'--p500'} hasCircle={true}>
                {IconNames.info}
              </Icon>
            ),
          };
        default:
          return {
            color: 'transparent',
            containerStyle: { borderTop: '2px solid transparent' },
            icon: null,
          };
      }
    },
    [type],
  );

  return (
    <div key={type} className={classNames('modal-header', className)} style={getHeaderData(type).containerStyle}>
      <div className={'modal-header-title-container'}>
        <AnimatedConditional condition={type !== 'default' && !hideTypeIcon}>
          <div className={'modal-header-icon-container'}>{getHeaderData(type).icon}</div>
        </AnimatedConditional>
        <Text type={titleTextType} fontWeight={FontWeights.bold} replacements={replacements}>
          {title}
        </Text>
        {children}
      </div>

      {!hideHeaderCloseBtn && closeFn && typeof closeFn === 'function' ? (
        <Button
          className={classNames(
            'modal-header-close-btn',
            hideCloseButtonOnMobile ? 'modal-header-close-btn-hidden-mobile' : '',
          )}
          testId={'modal-close-header-cta'}
          type={ButtonTypes.default}
          size={ButtonSizes.small}
          iconLeft={IconNames.close}
          iconSize={IconSize.large}
          iconColor={'--n500'}
          iconHoverColor={'--n700'}
          onClick={() => closeFn()}
        />
      ) : null}
    </div>
  );
};
