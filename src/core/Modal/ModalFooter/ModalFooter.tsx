import './ModalFooter.scss';

import { justifyContentBetween, justifyContentCenter, justifyContentEnd, justifyContentStart } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { AnimatedConditional } from '@vanguard/AnimatedConditional/AnimatedConditional';
import { Popover } from '@vanguard/Popover/Popover';
import { Render } from '@vanguard/Render/Render';
import { TextReplacements } from '@vanguard/Text/Text';
import React, { Dispatch, SetStateAction } from 'react';

import { Button, ButtonProps, ButtonShape, ButtonSizes, ButtonTypes } from '../../Button/Button';
import { ComponentContainer } from '../../ComponentContainer/ComponentContainer';
import { IconNames } from '../../Icon/IconNames';

export type ModalFooterAction = {
  cta: (change?: Dispatch<SetStateAction<number>>) => void;
  text: string;
  autogen?: boolean;
  hidden?: boolean;
  icon?: IconNames;
  iconPlacement?: 'left' | 'right';
  type?: ButtonTypes;
  replacements?: TextReplacements;
};

export type SubButtonProps = Pick<ButtonProps, 'isLoading' | 'disabled'>;

export interface ModalFooterProps {
  children?: React.ReactNode;
  buttonsPosition?: 'start' | 'end' | 'between' | 'center';
  className?: string;
  positive?: (ModalFooterAction & SubButtonProps & { popoverMessage?: string }) | null;
  neutral?: (ModalFooterAction & SubButtonProps & { popoverMessage?: string }) | null;
  negative?: (ModalFooterAction & SubButtonProps) | null;
  padding?: number | string;
  buttonsShape?: ButtonShape;
  showTopBorder?: boolean;
}

export const ModalFooter = (props: ModalFooterProps) => {
  const {
    positive,
    negative,
    neutral,
    className,
    buttonsPosition,
    padding,
    buttonsShape = 'default',
    children,
    showTopBorder,
  } = props;

  /**
   * Buttons position
   */
  let position = '';
  switch (buttonsPosition) {
    case 'start':
      position = justifyContentStart;
      break;
    case 'end':
      position = justifyContentEnd;
      break;
    case 'between':
      position = justifyContentBetween;
      break;
    case 'center':
      position = justifyContentCenter;
      break;
    default:
      position = justifyContentEnd;
  }

  const positiveIconPlacement = positive?.iconPlacement ?? 'right';
  const negativeIconPlacement = negative?.iconPlacement ?? 'left';
  const tertiaryIconPlacement = neutral?.iconPlacement ?? 'left';
  /**
   * Return View
   */
  const hasPositive = !!positive;
  const hasNegative = !!negative && !negative?.hidden;
  const hasNeutral = !!neutral && !neutral?.hidden;
  return (
    <ComponentContainer
      style={{ padding: padding ?? '16px 32px 32px 32px' }}
      className={classNames('modal-footer', showTopBorder ? 'modal-footer-border' : '', className)}
    >
      {children ? (
        children
      ) : (
        <div className={classNames('modal-footer-buttons', position)}>
          <AnimatedConditional animation={'none'} condition={hasNegative}>
            <Button
              type={negative?.type ?? ButtonTypes.default}
              testId={'modal-negative-cta'}
              iconLeft={negativeIconPlacement === 'left' ? negative?.icon : undefined}
              iconRight={negativeIconPlacement === 'right' ? negative?.icon : undefined}
              disabled={negative?.disabled}
              isLoading={negative?.isLoading}
              className="right-btn"
              onClick={() => {
                negative?.cta();
              }}
              shape={buttonsShape}
              replacements={negative?.replacements}
            >
              {negative?.text}
            </Button>
          </AnimatedConditional>
          <Render className={'modal-footer-group'} if={hasNeutral || hasPositive}>
            <Render if={hasNeutral}>
              <Popover position={'right'} message={neutral?.popoverMessage}>
                <Button
                  {...(neutral?.type
                    ? { type: neutral.type }
                    : { type: ButtonTypes.muted, size: ButtonSizes.extraLarge })}
                  testId={'modal-negative-cta'}
                  iconLeft={tertiaryIconPlacement === 'left' ? neutral?.icon : undefined}
                  iconRight={tertiaryIconPlacement === 'right' ? neutral?.icon : undefined}
                  disabled={neutral?.disabled}
                  isLoading={neutral?.isLoading}
                  className="center-btn"
                  onClick={() => {
                    neutral?.cta();
                  }}
                  shape={buttonsShape}
                  replacements={neutral?.replacements}
                >
                  {neutral?.text}
                </Button>
              </Popover>
            </Render>
            <AnimatedConditional animation={'none'} condition={hasPositive}>
              <Popover position={'right'} message={positive?.popoverMessage}>
                <Button
                  type={positive?.type ?? ButtonTypes.primary}
                  testId={'modal-positive-cta'}
                  iconLeft={positiveIconPlacement === 'left' ? positive?.icon : undefined}
                  iconRight={positiveIconPlacement === 'right' ? positive?.icon : undefined}
                  disabled={positive?.disabled}
                  isLoading={positive?.isLoading}
                  onClick={() => {
                    positive?.cta();
                  }}
                  shape={buttonsShape}
                  replacements={positive?.replacements}
                >
                  {positive?.text}
                </Button>
              </Popover>
            </AnimatedConditional>
          </Render>
        </div>
      )}
    </ComponentContainer>
  );
};
