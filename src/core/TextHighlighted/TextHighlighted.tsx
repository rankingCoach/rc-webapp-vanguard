import { classNames } from '@helpers/classNames';
// import parse from "html-react-parser";
import { parseCssVariable } from '@helpers/css-variables-parser';
import { translationHelper } from '@helpers/translation-helper';
import { translationService } from '@services/translation.service';
import { rcWindow } from '@stores/window.store';
import { childrenAsText } from '@vanguard/Text/child-to-text';
import { FontWeights, LinkReplacements, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import { parseFullLinks } from '@vanguard/Text/text-links-parser';
import { TextWrapBalancer } from '@vanguard/Text/TextWrapBalancer/TextWrapBalancer';
import React, { JSX, useMemo, useState } from 'react';
import { renderToString } from 'react-dom/server';
import sanitizeHtml from 'sanitize-html';

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

export const TextHighlighted = (props: TextHighlightedProps) => {
  const {
    type = TextTypes.text,
    children,
    textTight = false,
    ellipsis,
    maxWidth,
    maxChar,
    textAlign,
    fontWeight = FontWeights.regular,
    fontSize,
    textWrap = 'wrap',
    replacements,
    context = 'one',
    testId,
    translate = true,
    className = '',
    color,
    display = 'block',
    uppercase = false,
    links,
    balanced,
    disabled,
    capitalize = false,
    highlightWords,
    highlightColor,
    highlightMode = 'background',
    caseInsensitive = false,
  } = props;

  const writingStyle = rcWindow.translationsWritingStyle ? rcWindow.translationsWritingStyle : 'personal';

  /**
   * Translation
   */
  let translated = children;
  const [wasTranslated, setWasTranslated] = useState<boolean>(false);

  const translationCondition = (translationData: {
    value: string;
    wasTranslated: boolean;
    hasTranslationKey: boolean;
  }) => {
    if (translationHelper.shouldTrackTranslations) {
      return translationData.wasTranslated;
    }

    if (translationHelper.shouldTrackTranslationKeys) {
      return translationData.hasTranslationKey;
    }

    return false;
  };

  let translationData: any = null;
  let toTranslate = '';
  if (typeof children === 'string') {
    toTranslate = children;
  } else {
    toTranslate = childrenAsText(children);
  }
  translationData = useMemo(
    () => translationService.get(toTranslate, replacements, context, writingStyle),
    [replacements, children, context, writingStyle],
  );

  translationData.value = parseFullLinks(links, translationData.value);

  if (highlightWords && highlightWords.length) {
    highlightWords.forEach((word) => {
      if (caseInsensitive) {
        // Case insensitive replacement using regex
        const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = toTranslate.match(regex);

        if (matches) {
          matches.forEach((match) => {
            toTranslate = toTranslate.replace(
              match,
              renderToString(
                <span
                  style={{
                    backgroundColor: highlightMode === 'background' ? highlightColor : undefined,
                    color: highlightMode === 'text' ? highlightColor : undefined,
                    fontWeight: highlightMode === 'bold' ? 'bold' : undefined,
                  }}
                >
                  {match}
                </span>,
              ),
            );
          });
        }
      } else {
        // Case sensitive replacement (original behavior)
        toTranslate = toTranslate.replace(
          word,
          renderToString(
            <span
              style={{
                backgroundColor: highlightMode === 'background' ? highlightColor : undefined,
                color: highlightMode === 'text' ? highlightColor : undefined,
                fontWeight: highlightMode === 'bold' ? 'bold' : undefined,
              }}
            >
              {word}
            </span>,
          ),
        );
      }
    });
  }
  // translated = translate ? parse(translationData.value, { htmlparser2: { lowerCaseTags: false } }) : toTranslate;

  if (maxChar && typeof translated === 'string') {
    if (translated.length > maxChar) {
      translated = `${translated.slice(0, maxChar)}...`;
    }
  }

  useMemo(() => {
    if (translate) {
      if (translationHelper.shouldTrackTranslations || translationHelper.shouldTrackTranslationKeys) {
        setWasTranslated(translationCondition(translationData));
        if (!translationCondition(translationData)) {
          translationHelper.addUntranslated(childrenAsText(children));
        } else {
          translationHelper.addTranslated(childrenAsText(children));
        }
      }
    }
  }, [translationData, translationHelper.shouldTrackTranslations, translationHelper.shouldTrackTranslationKeys]);
  /**
   * FN: Get Classes
   * -------------------------------------------------------------------------------------------------------------------
   */
  const getClasses = () => {
    let classes = `rc-text ${type}`;

    if (textWrap) {
      classes += ` text-${textWrap}`;
    }

    if (textTight) {
      classes += ' text-tight';
    }

    /**
     *This class is added just for GOOGLE to not translate the text
     *
     * */
    if (!translate) {
      classes += ' notranslate';
    }

    // Adds coloured borders when tracking translation status
    if (translationHelper.shouldTrackTranslations || translationHelper.shouldTrackTranslationKeys) {
      if (!wasTranslated) {
        classes += ' not-translated';
      }

      if (wasTranslated) {
        classes += ' was-translated';
      }

      if (!translate) {
        classes += ' do-not-translate';
      }
    }

    if (uppercase) {
      classes += ' uppercase';
    }

    if (capitalize) {
      classes += ' text-capitalize';
    }

    if (className) {
      classes += ` ${className}`;
    }

    return classes;
  };

  /**
   * FN: Get Styles
   * -------------------------------------------------------------------------------------------------------------------
   */
  const getStyles = () => {
    const styles: Partial<React.CSSProperties> = {};

    if (disabled) {
      styles.color = parseCssVariable('--n300');
    }

    if (color) {
      styles.color = parseCssVariable(color);
    }

    if (fontWeight) {
      if (fontWeight === FontWeights.regular) {
        styles.fontWeight = 'normal';
      }
      if (fontWeight === FontWeights.medium) {
        styles.fontWeight = 500;
      }
      if (fontWeight === FontWeights.bold) {
        styles.fontWeight = 'bold';
      }
    }

    if (fontSize) {
      styles.fontSize = fontSize;
    }

    if (textAlign) {
      styles.textAlign = textAlign;
    }

    if (ellipsis) {
      styles.whiteSpace = 'nowrap';
      styles.overflow = 'hidden';
      styles.textOverflow = 'ellipsis';
      styles.maxWidth = maxWidth || '100%';
    }

    if (display) {
      styles.display = display;
    }

    return styles;
  };

  /**
   * -------------------------------------------------------------------------------------------------------------------
   * Return View
   * -------------------------------------------------------------------------------------------------------------------
   */
  const getContentProp = () => {
    /**
     * Idea is that we want to be able to push html to Text's children.
     * Ex: <Text>I am <b>Bold</b></Text>
     */
    if (typeof translated === 'string') {
      const sanitized = sanitizeHtml(translated, { allowedAttributes: { span: ['class'] } });

      return { dangerouslySetInnerHTML: { __html: sanitized } };
    }
    //@ts-ignore
    if (
      translated &&
      typeof translated === 'object' &&
      //@ts-ignore
      typeof translated[0] === 'object' &&
      links &&
      typeof links === 'object'
    ) {
      (translated as JSX.Element[]).forEach((element, index) => {
        if (element.type === 'a') {
          const linkElement = links[element.props.children];
          const translatedLinkText = translationService.get(linkElement.text);
          if (linkElement.href) {
            //@ts-ignore
            (translated ?? [])[index] = React.createElement(
              'a',
              {
                href: linkElement.href,
                key: index,
                style: { cursor: 'pointer' },
              },
              React.createElement('em', {}, translatedLinkText.value),
            );
          }
          if (linkElement.onClick) {
            //@ts-ignore
            (translated ?? [])[index] = React.createElement(
              'a',
              {
                onClick: linkElement.onClick,
                key: index,
                style: { cursor: 'pointer' },
              },
              React.createElement('em', {}, translatedLinkText.value),
            );
          }
        }
      });
    }
    return { children: translated };
  };
  /**
   * Headings
   * ---
   */
  if (type.indexOf('heading') >= 0) {
    const priority = type.split('-')[1];
    const HeadingName: any = `h${priority}`;
    return (
      <TextWrapBalancer balanced={balanced}>
        <HeadingName data-testid={testId} className={getClasses()} style={getStyles()} {...getContentProp()} />
      </TextWrapBalancer>
    );
  }

  /**
   * Display texts
   */
  if (type.indexOf('display') >= 0) {
    return (
      <TextWrapBalancer balanced={balanced}>
        <h1 data-testid={testId} className={getClasses()} style={getStyles()} {...getContentProp()} />
      </TextWrapBalancer>
    );
  }

  /**
   * Paragraphs (default)
   */
  return (
    <TextWrapBalancer balanced={balanced}>
      <span
        data-testid={testId}
        className={classNames('paragraph', getClasses())}
        style={getStyles()}
        {...getContentProp()}
      />
    </TextWrapBalancer>
  );
};
