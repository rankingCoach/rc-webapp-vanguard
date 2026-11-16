import './Accordion.scss';

import { classNames } from '@helpers/classNames';
import {
  Accordion as BaseAccordion,
  AccordionDetails,
  AccordionProps as BaseProps,
  AccordionSummary,
} from '@mui/material';
import * as React from 'react';
import { ReactNode, useEffect, useState } from 'react';

import type { VanguardLegacyAccordionProps } from '../_internal/mui-legacy-props';
import { Icon, IconSize } from '../Icon/Icon';
import { IconNames } from '../Icon/IconNames';

export type AccordionProps = {
  accordionId: string;
  summaryChildren?: ReactNode;
  detailsChildren: ReactNode;
  iconSize?: IconSize;
  iconName?: IconNames;
  summaryCustomStyle?: object;
  baseCustomStyle?: object;
  detailsCustomStyle?: object;
  reverse?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
} & Omit<BaseProps, 'children'> &
  VanguardLegacyAccordionProps;

export const Accordion = (props: AccordionProps) => {
  const {
    accordionId,
    summaryChildren,
    detailsChildren,
    disableGutters,
    variant,
    expanded,
    iconSize,
    iconName,
    summaryCustomStyle,
    baseCustomStyle,
    detailsCustomStyle,
    onExpandedChange,
    reverse = false,
  } = props;
  const [isExpanded, setIsExpanded] = useState(expanded ?? false);

  useEffect(() => {
    if (isExpanded !== expanded) {
      setIsExpanded(expanded ?? false);
    }
  }, [expanded]);

  const handleAccordionToggle = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    if (onExpandedChange) {
      onExpandedChange(newExpandedState);
    }
  };

  /**
   * @todo Refactor by using AnimatedConditional component ?
   */
  return (
    <BaseAccordion
      slots={{ heading: 'div' }}
      expanded={isExpanded}
      disableGutters={disableGutters}
      variant={variant}
      className={classNames('Accordion-container', reverse ? 'Accordion-reverse' : '')}
      style={baseCustomStyle}
    >
      <AccordionSummary
        onClick={handleAccordionToggle}
        expandIcon={
          !!summaryChildren ? (
            <Icon className={'Accordion-icon'} type={iconSize ?? IconSize.large}>
              {iconName ?? IconNames.caretDown}
            </Icon>
          ) : undefined
        }
        className={classNames(!summaryChildren ? 'AccordionSummary-hide' : '')}
        style={summaryCustomStyle}
        id={accordionId}
        aria-controls={accordionId}
      >
        {summaryChildren ?? <></>}
      </AccordionSummary>
      <AccordionDetails style={detailsCustomStyle}>{detailsChildren}</AccordionDetails>
    </BaseAccordion>
  );
};
