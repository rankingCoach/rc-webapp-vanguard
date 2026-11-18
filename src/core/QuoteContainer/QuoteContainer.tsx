import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import';
import { StyledSVG } from '@vanguard/StyledSVG/StyledSVG';
import classNames from 'classnames';
import React, { ReactNode } from 'react';

import styles from './QuoteContainer.module.scss';

interface QuoteContainerProps {
  children: ReactNode;
  className?: string; // Allow custom classes to be passed
}

/**
 * QuoteContainer - Wraps content with a quote mark SVG in the background
 *
 * The quote mark is positioned in the center vertically and 40px from the left
 */
export const QuoteContainer: React.FC<QuoteContainerProps> = ({ children, className }) => {
  // Load the quote marks SVG dynamically
  const { SvgIcon, loading, error } = useDynamicImport('QuoteMarks.svg');

  return (
    <div data-slot={'quote-container'} className={classNames(styles.quoteContainer, className)}>
      <div data-slot={'quote-container-body'} className={styles.body}>{children}</div>
      {!loading && !error && (
        <div data-slot={'quote-container-marks'} className={styles.quoteMarks}>
          <StyledSVG src={SvgIcon} />
        </div>
      )}
    </div>
  );
};

export default QuoteContainer;
