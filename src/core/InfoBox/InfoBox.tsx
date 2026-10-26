import {
  dFlex,
  flexWrap,
  gap1,
  justifyContentBetween,
  justifyContentCenter,
  justifyContentEnd,
  justifyContentStart,
  ml2,
  mr2,
  mt1,
  p2,
  pt2,
} from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { AnimatedConditional } from '@vanguard/AnimatedConditional/AnimatedConditional';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { Collapse } from '@vanguard/Collapse/Collapse/Collapse';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { InfoBoxBody } from '@vanguard/InfoBox/InfoBoxBody/InfoBoxBody';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, LinkReplacements, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React, { useEffect, useState } from 'react';

import styles from './InfoBox.module.scss';

export type InfoBoxType = 'danger' | 'info' | 'warn' | 'success';
export type InfoBoxPosition = 'start' | 'end' | 'center';
export type InfoBoxButtonAction = {
  cta: () => void;
  text: string;
  icon?: IconNames;
  type?: ButtonTypes;
};

export interface InfoBoxProps {
  type?: InfoBoxType;
  title?: string;
  description: string | string[] | React.ReactNode;
  replacements?: TextReplacements;
  links?: LinkReplacements;
  maxWidth?: string;
  width?: string;
  dismissible?: boolean;
  dismissCallback?: () => void;
  testId?: string;
  position?: InfoBoxPosition;
  positive?: InfoBoxButtonAction | null;
  negative?: InfoBoxButtonAction | null;
  className?: string;
  borderRadius?: number;
}

export const InfoBox = (props: InfoBoxProps) => {
  const [open, setOpen] = useState(true);
  const {
    type,
    title,
    description,
    maxWidth,
    dismissible,
    dismissCallback,
    testId,
    replacements,
    links,
    position = 'center',
    className,
    positive,
    negative,
    width,
    borderRadius = 4,
  } = props;

  useEffect(() => {
    if (title || description) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [title, description]);

  const getInfoBoxData = (type?: InfoBoxType): { color: string; icon: IconNames; iconColor: string } => {
    switch (type) {
      case 'danger':
        return {
          color: '--e500',
          iconColor: '--e100',
          icon: IconNames.exclamation,
        };
      case 'warn':
        return {
          color: '--w500',
          iconColor: '--w100',
          icon: IconNames.warning,
        };
      case 'success':
        return {
          color: '--s500',
          iconColor: '--s100',
          icon: IconNames.check,
        };
      case 'info':
      default:
        return {
          color: '--p500',
          iconColor: '--p100',
          icon: IconNames.info,
        };
    }
  };

  const getInfoBoxPositionStyle = (type?: InfoBoxPosition) => {
    switch (type) {
      case 'start':
        return justifyContentStart;
      case 'end':
        return justifyContentEnd;
      case 'center':
        return justifyContentCenter;
    }
  };

  const closeInfoBox = (isOpen: boolean) => {
    setOpen(isOpen);
    dismissCallback && dismissCallback();
  };

  if (!title && !description) {
    return null;
  }

  return (
    <Collapse isOpen={open}>
      <ComponentContainer
        testId={testId}
        className={classNames(styles.InfoBoxContainer, getInfoBoxPositionStyle(position), className)}
      >
        <div
          data-testid={'info-box-content'}
          className={classNames(styles.InfoBoxComponent, styles[type ? type : ''])}
          style={{ maxWidth: maxWidth, width: width, borderRadius: borderRadius }}
        >
          <Icon
            testId={'info-box-icon'}
            className={classNames(mr2)}
            type={type != 'warn' ? IconSize.small : IconSize.large}
            color={getInfoBoxData(type).color}
            hasCircle={type != 'warn'}
            fillColor={getInfoBoxData(type).iconColor}
          >
            {getInfoBoxData(type).icon}
          </Icon>
          <div>
            <AnimatedConditional condition={!!title}>
              <Text
                testId={'info-box-title'}
                type={TextTypes.text}
                fontWeight={FontWeights.medium}
                replacements={replacements}
                links={links}
              >
                {title}
              </Text>
            </AnimatedConditional>

            <Collapse isOpen={!!description}>
              <div className={classNames(!!title ? mt1 : undefined)}>
                <InfoBoxBody description={description} replacements={replacements} links={links} />
              </div>
            </Collapse>

            <Render if={!!negative || !!positive}>
              <div className={classNames(dFlex, justifyContentBetween, flexWrap, pt2, gap1)}>
                <Render if={!!positive}>
                  <Button
                    type={positive?.type ?? ButtonTypes.primary}
                    size={positive?.type === ButtonTypes.muted ? ButtonSizes.medium : ButtonSizes.extraLarge}
                    iconRight={positive?.icon}
                    onClick={() => {
                      positive?.cta();
                    }}
                  >
                    {positive?.text}
                  </Button>
                </Render>

                <Render if={!!negative}>
                  <Button
                    type={negative?.type ?? ButtonTypes.default}
                    size={negative?.type === ButtonTypes.muted ? ButtonSizes.medium : ButtonSizes.extraLarge}
                    iconLeft={negative?.icon}
                    onClick={() => {
                      negative?.cta();
                    }}
                  >
                    {negative?.text}
                  </Button>
                </Render>
              </div>
            </Render>
          </div>

          <AnimatedConditional condition={dismissible}>
            <Button
              testId={'info-box-cta'}
              type={ButtonTypes.default}
              iconColor={'--n500'}
              className={classNames('pointer', ml2, p2, styles.closeBtn)}
              color={'--n500'}
              size={ButtonSizes.medium}
              onClick={() => {
                closeInfoBox(false);
              }}
              iconLeft={IconNames.close}
            />
          </AnimatedConditional>
        </div>
      </ComponentContainer>
    </Collapse>
  );
};
