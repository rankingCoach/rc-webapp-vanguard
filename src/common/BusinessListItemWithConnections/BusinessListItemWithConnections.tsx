import { TextIcon } from '@common/TextIcon/TextIcon';
import { dFlex, dFlexColumn, gap1, justifyContentBetween, pb1, py3 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

export type BusinessListWithConnectionsProps = {
  title?: string;
  category?: string;
  address?: string;
  website?: string;
  btnType?: ButtonTypes;
  connectCallbackClick?: () => void;
  isButtonLoading?: boolean;
};

export const BusinessListItemWithConnections = (props: BusinessListWithConnectionsProps) => {
  const { title, category, isButtonLoading, connectCallbackClick, address, website, btnType } = props;

  return (
    <ComponentContainer>
      <div className={classNames(dFlex, justifyContentBetween, py3)}>
        <div className={classNames(dFlexColumn, gap1)}>
          <Text type={TextTypes.textIntro} fontWeight={FontWeights.bold} className={pb1}>
            {title}
          </Text>

          {category && (
            <TextIcon iconSize={IconSize.small} icon={IconNames.business} verticalAlign={'start'}>
              {category}
            </TextIcon>
          )}

          {address && (
            <TextIcon iconSize={IconSize.small} icon={IconNames.location} verticalAlign={'start'}>
              {address}
            </TextIcon>
          )}

          {website && (
            <TextIcon iconSize={IconSize.small} icon={IconNames.language} verticalAlign={'start'}>
              {website}
            </TextIcon>
          )}
        </div>

        {connectCallbackClick && (
          <Button
            isLoading={isButtonLoading}
            onClick={connectCallbackClick}
            type={btnType ?? ButtonTypes.primary}
            size={btnType === ButtonTypes.muted ? ButtonSizes.medium : ButtonSizes.extraLarge}
            iconRight={IconNames.arrowRight}
          >
            {'Connect'}
          </Button>
        )}
      </div>
    </ComponentContainer>
  );
};
