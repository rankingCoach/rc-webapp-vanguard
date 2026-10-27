import { GeneratedWithAIPill } from '@common/GeneratedWithAIPill/GeneratedWithAIPill';
import { InfoIcon } from '@common/InfoIcon/InfoIcon';
import { classNames } from '@helpers/classNames';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Popover } from '@vanguard/Popover/Popover';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './EditableCard.module.scss';

export type EditableCardTitleAIType = {
  show: boolean;
  text: string;
  tooltipMessage?: string;
};

export interface EditableCardProps {
  className?: string;
  title: string;
  titleWeight?: FontWeights;
  titleAiInfo?: EditableCardTitleAIType;
  editCallback: () => void;
  hideEditButton?: boolean;
  editButtonFloatRight?: boolean;
  popoverMessage?: string;
  children: React.ReactNode;
  testId?: string;
  translate?: boolean;
  hoverable?: boolean;
  padding?: boolean;
  actionBtns?: React.ReactNode;
  shouldHaveOnClickEventOnContainer?: boolean; // In some cases we do not want to have the onClick event on the whole container, for eg: on FineTuningServicesCard where there are several inner edit buttons inside card body
}

export const EditableCard = (props: EditableCardProps) => {
  const {
    className,
    title,
    titleWeight = FontWeights.medium,
    titleAiInfo,
    editCallback,
    editButtonFloatRight = false,
    hideEditButton,
    popoverMessage,
    children,
    testId,
    translate = true,
    hoverable = false,
    padding = false,
    actionBtns,
    shouldHaveOnClickEventOnContainer = true,
  } = props;

  /**
   *  the wrap button function has 2 main responsabilities
   *   - To wrap it in a popover if it has a message
   *   - to hide it if it should be hidden
   */
  function WrapButton(children: React.ReactElement, shouldHide = false) {
    if (shouldHide) {
      return null;
    }
    if (popoverMessage) {
      return <Popover message={popoverMessage}>{children}</Popover>;
    }
    return children;
  }

  return (
    <ComponentContainer
      testId={testId}
      className={classNames(
        styles.container,
        hoverable ? styles.hoverable : undefined,
        padding ? styles.padding : undefined,
        shouldHaveOnClickEventOnContainer && !!editCallback && !hideEditButton ? styles.editable : undefined,
        className,
      )}
      onClick={shouldHaveOnClickEventOnContainer && !!editCallback && !hideEditButton ? editCallback : undefined}
    >
      <div className={classNames(styles.header, editButtonFloatRight ? styles.editButtonFloatRight : undefined)}>
        <div>
          <Text testId={'title'} type={TextTypes.textIntro} fontWeight={titleWeight} translate={translate}>
            {title}
          </Text>

          {titleAiInfo?.show && (
            <>
              {titleAiInfo?.tooltipMessage && (
                <InfoIcon
                  message={titleAiInfo?.tooltipMessage}
                  theme={'dark'}
                  size={IconSize.small}
                  maxWidth={'fit-content'}
                />
              )}

              <GeneratedWithAIPill text={titleAiInfo.text} testId={'editable-card-generated-with-ai-pill'} />
            </>
          )}
        </div>

        <div className={styles.actionBtns}>
          {actionBtns}
          {WrapButton(
            <Button
              testId={'cta'}
              size={ButtonSizes.medium}
              iconLeft={IconNames.edit}
              iconSize={IconSize.small}
              iconColor={'--n500'}
              onClick={shouldHaveOnClickEventOnContainer ? undefined : editCallback}
              type={ButtonTypes.default}
            />,
            hideEditButton,
          )}
        </div>
      </div>

      <div className={styles.content}>{children}</div>
    </ComponentContainer>
  );
};
