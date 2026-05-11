import { FontWeights, LinkReplacements, TextReplacements, TextTypes } from '@vanguard/Text/Text.tsx';
import { TextAnimationProps } from '@vanguard/Text/text-animate-words-style';
import React from 'react';

export type { TextAnimationProps };

export type SeeMoreConfig =
  | {
      seeMoreContent: React.ReactNode;
      seeLessContent?: React.ReactNode;
      seeMoreVisible?: true | undefined;
    }
  | {
      seeMoreVisible: false;
    };

/**
 * TODO Move everything here
 * */
/**
 * Props
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type TextWordBreak = 'initial' | 'break-all' | 'break-word';

type BaseProps = {
  testId?: string;
  className?: string;

  children: string | string[] | React.ReactNode | React.ReactNode[];

  type?: TextTypes;
  fontWeight?: FontWeights;
  textTight?: boolean;
  fontSize?: number;
  color?: string | null;
  balanced?: boolean;

  maxWidth?: number;
  maxLines?: number;
  textWrap?: 'wrap' | 'no-wrap' | 'wrap-break-word' | 'pre-wrap' | 'pre';
  wordBreak?: TextWordBreak;
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
  isBlurred?: boolean;
  allowNewLines?: boolean;
  animateWords?: TextAnimationProps;
  highlightWords?: string[];
  highlightColor?: string;
  highlightMode?: 'background' | 'text' | 'bold';
  highlightCaseInsensitive?: boolean;
};

type SeeMoreProps =
  | {
      seeMore?: SeeMoreConfig; // Object form with detailed configuration
      maxChar?: number;
    }
  | {
      seeMore?: boolean; // Boolean form for simpler usage
      maxChar?: number;
    };

export type Props = BaseProps & SeeMoreProps;
