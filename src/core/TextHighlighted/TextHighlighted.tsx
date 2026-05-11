import { FontWeights, LinkReplacements, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

export interface Props {
  testId?: string;
  className?: string;

  children: string | string[] | React.ReactNode | React.ReactNode[];

  type?: TextTypes;
  fontWeight?: FontWeights;
  textTight?: boolean;
  fontSize?: number;
  color?: null | string;
  balanced?: boolean;

  maxWidth?: number;
  maxChar?: number;
  textWrap?: 'wrap' | 'no-wrap' | 'wrap-break-word';
  textAlign?: 'center' | 'end' | 'justify' | 'left' | 'match-parent' | 'right' | 'start';
  ellipsis?: boolean;
  display?: 'block' | 'inline';

  replacements?: TextReplacements;
  translate?: boolean;
  uppercase?: boolean;
  capitalize?: boolean;
  context?: 'one' | 'other';
  links?: LinkReplacements;
  disabled?: boolean;
  highlightWords?: string[];
  highlightColor?: string;
  highlightMode?: 'background' | 'text' | 'bold';
  caseInsensitive?: boolean;
}

export interface TextHighlightedProps extends Props {}

/**
 * @deprecated Use `Text` with `highlightWords`, `highlightColor`, `highlightMode`, and `highlightCaseInsensitive` props instead.
 */
export const TextHighlighted = ({ caseInsensitive, ...props }: TextHighlightedProps) => {
  return <Text {...props} highlightCaseInsensitive={caseInsensitive} />;
};
