import { alignItemsCenter, dFlex, mb1 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { AnimatedConditional } from '@vanguard/AnimatedConditional/AnimatedConditional';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { ListType } from '@vanguard/List/List';
import { FontWeights, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React, { ReactNode } from 'react';

import styles from './ListItem.module.scss';

export interface ListItemProps {
  children: ReactNode;
  selected?: boolean;
  type?: ListType | string;
  index: number;
  iconName?: IconNames;
  iconBackgroundColor?: string;
  iconColor?: string;
  iconHasCircle?: boolean;
  textType?: TextTypes;
  isText?: boolean;
  replacements?: TextReplacements;
  classNameListItem?: string;
  iconElement?: ReactNode;
  isComingSoon?: boolean;
}

export const ListItem = (props: ListItemProps) => {
  const {
    index,
    type = 'none',
    selected,
    children,
    iconName,
    iconBackgroundColor = 'n100',
    iconColor = '',
    iconHasCircle = false,
    textType = TextTypes.textCaption,
    isText = false,
    replacements,
    classNameListItem,
    iconElement,
    isComingSoon = false,
  } = props;
  const intToChar = (int: number) => {
    const code = 'a'.charCodeAt(0);
    return String.fromCharCode(code + int);
  };

  const getElementIndex = () => {
    switch (type) {
      case 'alphabetical':
        return intToChar(index);
      case 'numerical':
        return (
          <Text type={textType} fontWeight={FontWeights.medium} color={iconColor}>
            {`${index + 1}.`}
          </Text>
        );
      case 'icon':
        return (
          <Icon color={iconColor} hasCircle={iconHasCircle}>
            {iconName ?? IconNames.check}
          </Icon>
        );
      case 'object':
        return iconElement;
      case 'none':
      default:
        return null;
    }
  };

  return (
    <ComponentContainer data-slot={'list-item-container'}>
      {isComingSoon && (
        <div data-slot={'list-item-coming-soon'} className={classNames(styles.listItemCommingSoon)}>
          <Text fontWeight={FontWeights.bold} color={'#FFFFFF'}>
            Comming soon
          </Text>
        </div>
      )}
      <div data-slot={'list-item'} key={index} className={classNames(dFlex, alignItemsCenter, mb1, classNameListItem && classNameListItem)}>
        <AnimatedConditional condition={type !== 'none'}>
          <div
            data-testid={'iconList'}
            className={classNames(styles.listItemIcon, selected ? styles.selected : '')}
            style={{
              backgroundColor: iconBackgroundColor,
              color: iconColor,
              width: type === 'icon' ? '24px' : '32px',
              height: type === 'icon' ? '24px' : '32px',
            }}
          >
            {getElementIndex()}
          </div>
        </AnimatedConditional>
        <div data-slot={'list-item-content'} className={classNames(dFlex, alignItemsCenter)}>
          {isText ? (
            <Text type={textType} replacements={replacements}>
              {children}
            </Text>
          ) : (
            children
          )}
        </div>
      </div>
    </ComponentContainer>
  );
};
