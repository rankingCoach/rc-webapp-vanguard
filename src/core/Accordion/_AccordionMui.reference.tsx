import './Accordion.scss';

// Test-only reference: the former MUI implementation of Accordion, verbatim (rename only). Used by the parity spec
// and the Chromium differential story; not exported from the package.

import { classNames } from '@helpers/classNames';
import { AccordionDetails, AccordionSummary, Accordion as BaseAccordion } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Icon, IconSize } from '../Icon/Icon';
import { IconNames } from '../Icon/IconNames';
import type { AccordionProps } from './Accordion';

export const AccordionMui = (props: AccordionProps) => {
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
          summaryChildren ? (
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
