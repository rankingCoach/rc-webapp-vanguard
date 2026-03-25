import { translationService } from '@services/translation.service';
import { rcWindow } from '@stores/window.store';
import { childrenAsText } from '@vanguard/Text/child-to-text';
import { Text } from '@vanguard/Text/Text.tsx';
import { Props as TextProps } from '@vanguard/Text/Text.types';
import React from 'react';
import { renderToString } from 'react-dom/server';

export type Props = TextProps & {
  highlightWords?: string[];
  highlightColor?: string;
  highlightMode?: 'background' | 'text' | 'bold';
  caseInsensitive?: boolean;
};

export type TextHighlightedProps = Props;

export const TextHighlighted = ({
  highlightWords,
  highlightColor,
  highlightMode = 'background',
  caseInsensitive = false,
  translate = true,
  replacements,
  context = 'one',
  children,
  ...textProps
}: TextHighlightedProps) => {
  const writingStyle = rcWindow.translationsWritingStyle ?? 'personal';

  // Get plain text from children
  let text = typeof children === 'string' ? children : childrenAsText(children);

  // Translate first if needed, so highlights apply to the translated string
  if (translate) {
    text = translationService.get(text, replacements, context, writingStyle).value;
  }

  // Apply highlight spans
  if (highlightWords?.length) {
    const spanStyle = {
      backgroundColor: highlightMode === 'background' ? highlightColor : undefined,
      color: highlightMode === 'text' ? highlightColor : undefined,
      fontWeight: highlightMode === 'bold' ? ('bold' as const) : undefined,
    };

    highlightWords.forEach((word) => {
      if (caseInsensitive) {
        const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = text.match(regex);
        if (matches) {
          matches.forEach((match) => {
            text = text.replace(match, renderToString(<span style={spanStyle}>{match}</span>));
          });
        }
      } else {
        text = text.replace(word, renderToString(<span style={spanStyle}>{word}</span>));
      }
    });
  }

  // Delegate all rendering to Text — pass translate=false since we already translated above
  return (
    <Text {...textProps} replacements={replacements} context={context} translate={false}>
      {text}
    </Text>
  );
};
