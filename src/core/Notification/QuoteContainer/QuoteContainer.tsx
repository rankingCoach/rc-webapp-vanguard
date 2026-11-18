import './QuouteContainer.scss';

import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import';
import { alignItemsCenter, dFlex, dFlexColumn, justifyContentBetween } from '@globalStyles';
import React, { ReactNode } from 'react';

import { classNames } from '../../../helpers/classNames';
import { StyledSVG } from '../../StyledSVG/StyledSVG';

interface Props {
  children: ReactNode;
}

export const QuoteContainer = (props: Props) => {
  const { children } = props;

  const { SvgIcon, loading, error } = useDynamicImport('QuoteMarks.svg');

  return (
    <div>
      <div data-slot={'notification-quote'} className={classNames('quote-container', dFlex, justifyContentBetween)}>
        <div data-slot={'notification-quote-content'} className={classNames(dFlexColumn, alignItemsCenter)}>{children}</div>
        <div data-slot={'notification-quote-marks'} className="quote-marks">
          <SvgIcon />
          <StyledSVG src={SvgIcon} />
        </div>
      </div>
    </div>
  );
};
