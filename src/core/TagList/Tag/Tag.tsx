import './Tag.scss';

import { px1 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Popover } from '@vanguard/Popover/Popover';
import { Render } from '@vanguard/Render/Render';
import { TagType } from '@vanguard/TagList/Tag/TagType.enum';
import React from 'react';

import { ComponentContainer } from '../../ComponentContainer/ComponentContainer';
import { FontWeights, Text } from '../../Text/Text';

export type TagVariant = 'chip' | 'tag' | 'chip-filled';

export interface TagProps {
  id?: number | string;
  text?: string;
  type?: TagType;
  textColor?: string;
  /** `chip-filled`: the small filled chip (24px, muted fill, 12px medium text, not uppercase). */
  variant?: TagVariant;
  active?: boolean;
  hidden?: boolean;
  hasDeleteBtn?: boolean;
  popoverMessage?: string;
  deleteBtnCallback?: (id?: number | string) => void;
  hasInnerElement?: boolean;
  innerElement?: React.ReactNode;
}

export const Tag = (props: TagProps) => {
  const {
    id,
    text,
    type = 'tag-default',
    hasDeleteBtn,
    deleteBtnCallback,
    popoverMessage,
    variant = 'tag',
    active,
    hidden = false,
    textColor,
    hasInnerElement,
    innerElement,
  } = props;

  /**
   * Apply Popover
   */
  function applyPopover(children: React.ReactElement) {
    if (popoverMessage) {
      return (
        <Popover message={popoverMessage} wrapChildren={false} maxWidth={'512px'}>
          {children}
        </Popover>
      );
    }
    return children;
  }

  /**
   * Return View
   */
  return (
    <ComponentContainer data-slot={'tag-container'} className={classNames('Tag-container', hidden ? 'hidden' : '')}>
      {applyPopover(
        <div data-slot={'tag'} data-variant={variant} data-type={type} className={`${variant} ${type}`} style={active ? { opacity: '1' } : {}}>
          <Text
            color={textColor ?? textColor}
            fontWeight={variant === 'chip-filled' ? FontWeights.medium : undefined}
            translate={false}
          >
            {text}
          </Text>
          <Render if={hasInnerElement}>
            <div data-slot={'tag-content'} className={classNames(px1)}>{innerElement}</div>
          </Render>
          {hasDeleteBtn && (
            <div
              data-slot={'tag-delete'}
              className={'tag-btn-delete'}
              onClick={() => {
                // @todo Move delete event to the Tag itself??
                deleteBtnCallback && deleteBtnCallback(id);
              }}
            >
              <Icon forceSize={16} color={'inherit'} hoverColor={'inherit'}>
                {IconNames.close}
              </Icon>
            </div>
          )}
        </div>,
      )}
    </ComponentContainer>
  );
};
