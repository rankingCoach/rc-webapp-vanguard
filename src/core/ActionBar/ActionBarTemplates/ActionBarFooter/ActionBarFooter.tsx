import { Button, ButtonProps, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { getRowButtonTypeAndSize } from '@vanguard/Button/button-row-size';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import React from 'react';

import styles from './ActionBarFooter.module.scss';

/**
 * Types
 */

export type ActionBarFooterButton = {
  text: string;
  onClick: () => void;
  props?: ButtonProps;
};

// PROPS
export type ActionBarFooterProps = {
  buttons: ActionBarFooterButton[];
};

/**
 * Component
 * @todo This is an example implementation base on the Flow Footer design. Re-think it when proper Concept available
 */
export const ActionBarFooter = (props: ActionBarFooterProps) => {
  const { buttons } = props;
  return (
    <ComponentContainer
      testId={'ActionBarFooter_Container'}
      className={buttons.length === 2 ? styles.container : styles.containerCenter}
    >
      {buttons.map((footerButton, idx) => {
        const buttonProps = footerButton.props;
        // Defaults only apply when the consumer doesn't pick a type: the last button is primary, the others muted.
        // Without a `type` the consumer props can only be the non-muted variant; TS can't narrow on the optional
        // discriminant, hence the cast.
        const typedProps: ButtonProps =
          buttonProps && 'type' in buttonProps
            ? buttonProps
            : idx === buttons.length - 1
              ? ({ ...buttonProps, type: ButtonTypes.primary } as ButtonProps)
              : {
                  ...buttonProps,
                  type: ButtonTypes.muted,
                  // secondary small (32px) used to map to muted medium (32px); keep that for existing consumers
                  size: buttonProps?.size === ButtonSizes.small ? ButtonSizes.medium : undefined,
                };
        // Unless the consumer sets a size, muted buttons get the row size so they match the others' height
        const resolvedProps: ButtonProps =
          typedProps.type === ButtonTypes.muted && !typedProps.size
            ? { ...typedProps, size: getRowButtonTypeAndSize(ButtonTypes.muted).size }
            : typedProps;
        return (
          <Button key={idx} testId={`ActionBarFooter_${idx}`} onClick={footerButton.onClick} {...resolvedProps}>
            {footerButton.text}
          </Button>
        );
      })}
    </ComponentContainer>
  );
};
