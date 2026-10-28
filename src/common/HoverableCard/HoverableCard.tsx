import { InfoIcon } from '@common/InfoIcon/InfoIcon';
import { dFlex, h100, ml2, pb2, pl3, pr3, pt2 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { AnimatedConditional } from '@vanguard/AnimatedConditional/AnimatedConditional';
import { Button, ButtonProps, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Popover } from '@vanguard/Popover/Popover';
import { FontWeights, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './HoverableCard.module.scss';

interface HoverableCardSubtitlesProps {
  subtitles?: string[];
  replacements?: TextReplacements;
  translate?: boolean;
}

export const HoverableCardSubtitles = (props: HoverableCardSubtitlesProps) => {
  const { subtitles, replacements, translate } = props;

  if (!subtitles || !subtitles.length) return null;

  return (
    <div className={classNames(dFlex, styles.subtitlesContainer)}>
      {subtitles.map((subtitle: string, index: number) => {
        return (
          <React.Fragment key={index}>
            {!!index && <div className={classNames(styles.separator)} />}
            <Text
              testId={'subtitle'}
              type={TextTypes.textHelp}
              fontWeight={FontWeights.medium}
              replacements={replacements}
              translate={translate}
            >
              {subtitle}
            </Text>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export interface HoverableCardProps {
  className?: string;
  title?: string;
  subtitles?: string[];
  buttonProps?: ButtonProps;
  onClick: () => void;
  children: React.ReactNode;
  testId?: string;
  disableHover?: boolean;
  replacements?: TextReplacements;
  translate?: boolean;
  isShowingInfoIcon?: boolean;
  infoIconMessage?: string;
  forceShowingCTA?: boolean;
  disabled?: boolean;
  popoverMessage?: string;
}

export const HoverableCard = (props: HoverableCardProps) => {
  const {
    className,
    title,
    subtitles,
    onClick,
    children,
    testId,
    buttonProps,
    disableHover = false,
    replacements,
    translate,
    isShowingInfoIcon,
    infoIconMessage,
    forceShowingCTA,
    disabled = false,
    popoverMessage,
  } = props;

  const popoverWrap = (component: React.ReactElement) => {
    if (popoverMessage) {
      return <Popover message={popoverMessage}>{component}</Popover>;
    }

    return component;
  };

  return popoverWrap(
    <ComponentContainer
      testId={testId}
      className={classNames(
        className,
        styles.hoverableCard,
        pt2,
        pb2,
        pr3,
        pl3,
        h100,
        disableHover ? '' : styles.hoverEnabled,
        disabled ? styles.disabled : '',
      )}
      onClick={(e) => {
        !disableHover && onClick();
      }}
    >
      <div className={styles.header}>
        <div>
          <Text className={styles.title} testId={'title'} fontWeight={FontWeights.regular} replacements={replacements}>
            {title}
          </Text>

          <HoverableCardSubtitles subtitles={subtitles} translate={translate} replacements={replacements} />
        </div>
        <AnimatedConditional condition={!disableHover || forceShowingCTA}>
          {isShowingInfoIcon ? (
            <InfoIcon size={IconSize.small} title={title} message={infoIconMessage} />
          ) : (
            <Button
              testId={'cta'}
              size={ButtonSizes.medium}
              iconLeft={IconNames.edit}
              iconSize={IconSize.small}
              iconColor={'--n500'}
              type={ButtonTypes.default}
              className={classNames(ml2)}
              onClick={() => {
                disableHover && onClick();
              }}
              {...buttonProps}
            />
          )}
        </AnimatedConditional>
      </div>
      <div className={styles.content}>{children}</div>
    </ComponentContainer>,
  );
};
