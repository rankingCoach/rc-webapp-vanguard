import './ErrorImagesList.scss';

import { alignItemsCenter, dFlex, dFlexColumn, justifyContentCenter, mb3, mr2 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { FontWeights, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

export type MediaItemsErrorsDisplay = Record<
  string,
  {
    mediaItemsWithErrors: string[];
    replacements?: TextReplacements;
  }
>;
interface Props {
  mediaItemsErrors: MediaItemsErrorsDisplay;
  validMediaItemsCount: number;
  invalidMediaItemsCount?: number;
}

export const ErrorImagesList = (props: Props) => {
  const { mediaItemsErrors, validMediaItemsCount, invalidMediaItemsCount = 0 } = props;
  if (!Object.keys(mediaItemsErrors).length) {
    return null;
  }
  return (
    <ComponentContainer data-slot="error-images-list" className={'ErrorImagesList-container'}>
      <div data-slot="error-images-list-summary" className={classNames(dFlex, mb3, justifyContentCenter, alignItemsCenter)}>
        <Icon className={mr2} hasCircle={true} type={IconSize.small} color={'--e500'}>
          {IconNames.exclamation}
        </Icon>
        <Text replacements={{ no_of_issues: invalidMediaItemsCount }}>
          {"We have identified %no_of_issues% issue(s) with the media items you've uploaded."}
        </Text>
      </div>
      {Object.keys(mediaItemsErrors).map((errorText, idx) => {
        return (
          <div data-slot="error-images-list-error" key={idx} className={classNames(dFlexColumn, alignItemsCenter)}>
            <Text type={TextTypes.textHelp} replacements={mediaItemsErrors[errorText].replacements}>
              {errorText}
            </Text>
            {mediaItemsErrors[errorText].mediaItemsWithErrors.map((error, index) => {
              return (
                <Text type={TextTypes.textHelp} key={index} fontWeight={FontWeights.bold}>
                  {error}
                </Text>
              );
            })}
          </div>
        );
      })}
    </ComponentContainer>
  );
};
