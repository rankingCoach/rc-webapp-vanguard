import { Text, TextProps } from '@vanguard/Text/Text';
import React from 'react';

/** The Text props TextHighlighted accepts, taken from Text so the two cannot drift apart. */
type TextPropsSubset = Pick<
  TextProps,
  | 'testId'
  | 'className'
  | 'children'
  | 'type'
  | 'fontWeight'
  | 'textTight'
  | 'fontSize'
  | 'color'
  | 'balanced'
  | 'maxWidth'
  | 'maxChar'
  | 'textAlign'
  | 'ellipsis'
  | 'display'
  | 'replacements'
  | 'translate'
  | 'uppercase'
  | 'capitalize'
  | 'context'
  | 'links'
  | 'disabled'
  | 'highlightWords'
  | 'highlightColor'
  | 'highlightMode'
>;

export interface Props extends TextPropsSubset {
  /** Narrower than Text's (no 'pre-wrap' | 'pre'): TextHighlighted never accepted those. */
  textWrap?: 'wrap' | 'no-wrap' | 'wrap-break-word';
  caseInsensitive?: boolean;
}

export interface TextHighlightedProps extends Props {}

/**
 * @deprecated Use `Text` with `highlightWords`, `highlightColor`, `highlightMode`, and `highlightCaseInsensitive` props instead.
 */
export const TextHighlighted = ({ caseInsensitive, ...props }: TextHighlightedProps) => {
  return <Text {...props} highlightCaseInsensitive={caseInsensitive} />;
};
