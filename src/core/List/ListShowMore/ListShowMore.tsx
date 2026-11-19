import { AnimatedConditional } from '@vanguard/AnimatedConditional/AnimatedConditional';
import { OwnCollapse } from '@vanguard/Collapse/Collapse/own-collapse';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconNames } from '@vanguard/Icon/IconNames';
import { ListElementSchema, ListProps } from '@vanguard/List/List';
import { ListItem } from '@vanguard/ListItem/ListItem';
import { CtaWithIcon } from '@vanguard/Table/common/CtaWithIcon/CtaWithIcon';
import { FontWeights, Text } from '@vanguard/Text/Text';
import React, { useEffect, useState } from 'react';

export type ListShowMoreProps = {} & ListProps;

export const ListShowMore = (props: ListShowMoreProps) => {
  const { limit, listElements, type } = props;

  const [currentlyDisplayed, setCurrentlyDisplayed] = useState<number>(limit ?? listElements.length);

  useEffect(() => {}, [limit, listElements]);

  if (!limit) {
    return null;
  }

  if (listElements.length <= limit) {
    return null;
  }

  return (
    <ComponentContainer>
      <OwnCollapse in={currentlyDisplayed > limit} timeout={1500}>
        <div>
          {listElements
            .filter((e: ListElementSchema, index: number) => index >= limit)
            .map((listElement: ListElementSchema, index: number) => {
              return (
                <ListItem
                  key={index + limit}
                  selected={listElement.selected}
                  type={type}
                  index={index + limit}
                  iconName={listElement.iconName}
                  iconColor={listElement.iconColor}
                  iconBackgroundColor={listElement.iconBackgroundColor}
                >
                  {listElement.content}
                </ListItem>
              );
            })}
        </div>
      </OwnCollapse>

      <AnimatedConditional condition={currentlyDisplayed < listElements.length} animation={'none'}>
        <CtaWithIcon
          onClick={(e) => {
            setCurrentlyDisplayed(listElements.length);
          }}
          icon={IconNames.caretDown}
          position={'left'}
        >
          <Text fontWeight={FontWeights.medium}>Show all features</Text>
        </CtaWithIcon>
      </AnimatedConditional>

      <AnimatedConditional condition={currentlyDisplayed >= listElements.length} animation={'none'}>
        <CtaWithIcon
          onClick={(e) => {
            setCurrentlyDisplayed(limit);
          }}
          icon={IconNames.caretUp}
          position={'left'}
        >
          <Text fontWeight={FontWeights.medium}>Show less</Text>
        </CtaWithIcon>
      </AnimatedConditional>
    </ComponentContainer>
  );
};
