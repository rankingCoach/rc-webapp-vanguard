import { Button, ButtonProps, ButtonTypes } from '@vanguard/Button/Button';
import { ROW_BUTTON_SIZE } from '@vanguard/Button/button-row-size';
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
            : ({
                ...buttonProps,
                type: idx === buttons.length - 1 ? ButtonTypes.primary : ButtonTypes.muted,
              } as ButtonProps);
        // Unless the consumer sets a size, every button gets the row size so they all share one height
        const resolvedProps: ButtonProps = typedProps.size
          ? typedProps
          : ({ ...typedProps, size: ROW_BUTTON_SIZE } as ButtonProps);
        return (
          <Button key={idx} testId={`ActionBarFooter_${idx}`} onClick={footerButton.onClick} {...resolvedProps}>
            {footerButton.text}
          </Button>
        );
      })}
    </ComponentContainer>
  );
};
