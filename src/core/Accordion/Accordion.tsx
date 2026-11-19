// Ported from @mui/material@9.5.0 Accordion/Accordion.js, AccordionSummary/AccordionSummary.js, AccordionDetails/AccordionDetails.js, Paper/Paper.js (MIT)
import './Accordion.scss';

import { classNames } from '@helpers/classNames';
import type { AccordionProps as BaseProps } from '@mui/material';
import * as React from 'react';
import { CSSProperties, ReactNode, useEffect, useState } from 'react';
import { ButtonBase } from '../../primitives/react/ButtonBase/ButtonBase';
import type { VanguardLegacyAccordionProps } from '../_internal/mui-legacy-props';
import { OwnCollapse } from '../Collapse/Collapse/own-collapse';
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

/** MUI 9.5 `theme.shadows[1]`: Paper elevation 1 writes it to `--Paper-shadow` (light palette, no CSS vars). */
const PAPER_SHADOW_1 =
  '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)';

/**
 * Renders MUI 9.5 Accordion's DOM (Paper root > heading div > summary button + Collapse(timeout 'auto') > region >
 * details) with the same Mui* classes and aria for the props Vanguard forwards to MUI: `expanded` (Vanguard's own
 * state), `disableGutters` and `variant`. Every other MUI prop in the public type was never forwarded and stays
 * ignored (locked by _Accordion.mui.spec). Emotion's rules are static in _Accordion.compat.scss (D15 last block).
 */
export const Accordion = (props: AccordionProps) => {
  const {
    accordionId,
    summaryChildren,
    detailsChildren,
    disableGutters = false,
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

  const outlined = variant === 'outlined';
  const expandedClass = isExpanded ? 'Mui-expanded' : undefined;

  return (
    <div
      data-vg-core=""
      data-slot={'accordion'}
      data-variant={outlined ? 'outlined' : 'elevation'}
      data-open={isExpanded ? '' : undefined}
      className={classNames(
        'MuiPaper-root',
        outlined ? 'MuiPaper-outlined' : 'MuiPaper-elevation',
        'MuiPaper-rounded',
        outlined ? undefined : 'MuiPaper-elevation1',
        'MuiAccordion-root',
        'MuiAccordion-rounded',
        expandedClass,
        disableGutters ? undefined : 'MuiAccordion-gutters',
        'Accordion-container',
        reverse ? 'Accordion-reverse' : '',
      )}
      style={{ ...(outlined ? {} : ({ '--Paper-shadow': PAPER_SHADOW_1 } as CSSProperties)), ...baseCustomStyle }}
    >
      <div data-vg-core="" data-slot={'accordion-heading'} className={'MuiAccordion-heading'}>
        <ButtonBase
          data-vg-core=""
          data-slot={'accordion-summary'}
          className={classNames(
            'MuiAccordionSummary-root',
            expandedClass,
            disableGutters ? undefined : 'MuiAccordionSummary-gutters',
            !summaryChildren ? 'AccordionSummary-hide' : '',
          )}
          focusVisibleClassName={'Mui-focusVisible'}
          focusRipple={false}
          disableRipple
          aria-expanded={isExpanded}
          onClick={handleAccordionToggle}
          style={summaryCustomStyle as CSSProperties}
          id={accordionId}
          aria-controls={accordionId}
        >
          <span
            data-vg-core=""
            data-slot={'accordion-summary-content'}
            className={classNames('MuiAccordionSummary-content', expandedClass)}
          >
            {summaryChildren ?? <></>}
          </span>
          {!!summaryChildren && (
            <span
              data-vg-core=""
              data-slot={'accordion-icon'}
              className={classNames('MuiAccordionSummary-expandIconWrapper', expandedClass)}
            >
              <Icon className={'Accordion-icon'} type={iconSize ?? IconSize.large}>
                {iconName ?? IconNames.caretDown}
              </Icon>
            </span>
          )}
        </ButtonBase>
      </div>
      <OwnCollapse in={isExpanded} timeout={'auto'}>
        <div
          data-vg-core=""
          data-slot={'accordion-region'}
          aria-labelledby={accordionId}
          id={accordionId}
          role={'region'}
          className={'MuiAccordion-region'}
        >
          <div
            data-vg-core=""
            data-slot={'accordion-details'}
            className={'MuiAccordionDetails-root'}
            style={detailsCustomStyle as CSSProperties}
          >
            {detailsChildren}
          </div>
        </div>
      </OwnCollapse>
    </div>
  );
};
