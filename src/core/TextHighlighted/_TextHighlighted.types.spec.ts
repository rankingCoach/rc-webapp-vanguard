import type React from 'react';
import { describe, expectTypeOf, it } from 'vitest';

import type { FontWeights, LinkReplacements, TextReplacements, TextTypes } from '../Text/Text';
import type { Props, TextHighlightedProps } from './TextHighlighted';

/** The props TextHighlighted accepted when they were written out by hand (before being derived from Text's). */
interface LegacyProps {
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

describe('TextHighlighted props', () => {
  it('accept exactly the hand-written legacy shape', () => {
    expectTypeOf<Props>().toEqualTypeOf<LegacyProps>();
    expectTypeOf<TextHighlightedProps>().toEqualTypeOf<LegacyProps>();
  });
});
