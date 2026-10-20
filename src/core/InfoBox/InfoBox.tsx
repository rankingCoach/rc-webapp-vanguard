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
  pt2,
} from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { AnimatedConditional } from '@vanguard/AnimatedConditional/AnimatedConditional';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { getRowButtonTypeAndSize } from '@vanguard/Button/button-row-size';
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
    borderRadius,
  } = props;

  useEffect(() => {
    if (title || description) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [title, description]);

  const getInfoBoxData = (): { color: string; icon: IconNames; iconColor: string } => {
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
          icon: IconNames.exclamation,
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

  const getInfoBoxPositionStyle = (infoBoxPosition?: InfoBoxPosition) => {
    switch (infoBoxPosition) {
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

  const infoBoxData = getInfoBoxData();

  return (
    <Collapse isOpen={open}>
      <ComponentContainer
        testId={testId}
        className={classNames(styles.InfoBoxContainer, getInfoBoxPositionStyle(position), className)}
      >
        <div
          data-testid={'info-box-content'}
          className={styles.InfoBoxComponent}
          style={{ maxWidth: maxWidth, width: width, borderRadius: borderRadius }}
        >
          <div className={classNames(styles.firstLine, mr2, !title && styles.noTitle)}>
            {/* warn sits in a filled triangle (styles), the other types in Icon's filled circle */}
            <Icon
              testId={'info-box-icon'}
              className={classNames(type === 'warn' && styles.warnTriangle)}
              type={IconSize.small}
              color={infoBoxData.color}
              hasCircle={type !== 'warn'}
              fillColor={infoBoxData.iconColor}
            >
              {infoBoxData.icon}
            </Icon>
          </div>
          <div data-testid={'info-box-body'} className={styles.body}>
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
                    {...getRowButtonTypeAndSize(positive?.type ?? ButtonTypes.primary)}
                    rounded={true}
                    icon={positive?.icon}
                    iconPosition={'right'}
                    onClick={() => {
                      positive?.cta();
                    }}
                  >
                    {positive?.text}
                  </Button>
                </Render>

                <Render if={!!negative}>
                  <Button
                    {...getRowButtonTypeAndSize(negative?.type ?? ButtonTypes.muted)}
                    rounded={true}
                    icon={negative?.icon}
                    iconPosition={'left'}
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
            <div className={classNames(styles.firstLine, ml2, !title && styles.noTitle)}>
              <Button
                testId={'info-box-cta'}
                type={ButtonTypes.muted}
                size={ButtonSizes.small}
                onClick={() => {
                  closeInfoBox(false);
                }}
                icon={IconNames.close}
                rounded={true}
              />
            </div>
          </AnimatedConditional>
        </div>
      </ComponentContainer>
    </Collapse>
  );
};
