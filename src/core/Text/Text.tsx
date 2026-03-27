import './Text.scss';

import { classNames } from '@helpers/classNames';
import { parseCssVariable } from '@helpers/css-variables-parser';
import { sanitizeHTMLToReactNode } from '@helpers/sanitize-html';
import { translationHelper } from '@helpers/translation-helper';
import { translationService } from '@services/translation.service';
import { rcWindow } from '@stores/window.store';
import { Props } from '@vanguard/Text/Text.types';
import { applyWordAnimation } from '@vanguard/Text/text-animate-words-style';
import { parseFullLinks } from '@vanguard/Text/text-links-parser';
import { TextWrapBalancer } from '@vanguard/Text/TextWrapBalancer/TextWrapBalancer';
import parse from 'html-react-parser';
import * as React from 'react';
import { JSX, useMemo, useState } from 'react';
import { renderToString } from 'react-dom/server';

import { childrenAsText } from './child-to-text';

/**
 * Types
 */
export enum TextTypes {
  'heading1' = 'heading-1',
  'heading2' = 'heading-2',
  'heading3' = 'heading-3',
  'heading4' = 'heading-4',
  'textIntro' = 'text-intro',
  'text' = 'text',
  'textHelp' = 'text-help',
  'textCaption' = 'text-caption',
  'display1' = 'display-1',
  'display2' = 'display-2',
}

export enum FontWeights {
  regular = 'regular',
  medium = 'medium',
  bold = 'bold',
}

export type TextReplacements = Record<string, string | number | React.ReactNode>;

export type LinkReplacementsData = {
  text: string;
  onClick?: (() => void) | string;
  href?: string;
  target?: '_blank';
};
export type LinkReplacements = Record<string, LinkReplacementsData>;

export type TextProps = Props;

/**
 * Component
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const Text = (props: TextProps & Omit<React.HTMLAttributes<HTMLElement>, 'translate'>) => {
  const {
    type = TextTypes.text,
    children,
    textTight = false,
    maxWidth,
    maxChar, // Updated prop name
    maxLines,
    textAlign,
    fontWeight = FontWeights.regular,
    fontSize,
    textWrap = 'wrap',
    wordBreak = 'initial',
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
    isBlurred = false,
    seeMore = false,
    ellipsis,
    allowNewLines = false,
    animateWords = undefined,
    highlightWords,
    highlightColor,
    highlightMode = 'background',
    highlightCaseInsensitive = false,
    ...rest
  } = props;

  const writingStyle = rcWindow.translationsWritingStyle ? rcWindow.translationsWritingStyle : 'personal';

  /**
   * Translation
   */
  let translated = children;
  const [wasTranslated, setWasTranslated] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [showSeeMore, setShowSeeMore] = useState<boolean>(false);

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
  const seeMoreVisible =
    typeof seeMore === 'object' && (seeMore.seeMoreVisible === true || seeMore.seeMoreVisible === undefined);

  translationData = useMemo(() => {
    const translation = translationService.get(toTranslate, replacements, context, writingStyle);
    const parsed = parseFullLinks(links, translation.value);
    if (maxChar && typeof parsed === 'string') {
      if (translation.value.length > maxChar) {
        setShowSeeMore(true);
      } else {
        setShowSeeMore(false);
      }
    }
    return {
      value: parsed,
      fixedValue: parsed,
      wasTranslated: translation.wasTranslated,
      // include other properties from the translation object as needed
    };
  }, [replacements, children, context, writingStyle, links]);

  translated = translate
    ? parse(translationData.value, { htmlparser2: { lowerCaseTags: false } })
    : translationService.justReplace(toTranslate, replacements);

  if (typeof translated === 'string' && highlightWords?.length) {
    const spanStyle = {
      backgroundColor: highlightMode === 'background' ? highlightColor : undefined,
      color: highlightMode === 'text' ? highlightColor : undefined,
      fontWeight: highlightMode === 'bold' ? ('bold' as const) : undefined,
    };

    highlightWords.forEach((word) => {
      if (highlightCaseInsensitive) {
        const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = (translated as string).match(regex);
        if (matches) {
          matches.forEach((match) => {
            translated = (translated as string).replace(match, renderToString(<span style={spanStyle}>{match}</span>));
          });
        }
      } else {
        translated = (translated as string).replace(word, renderToString(<span style={spanStyle}>{word}</span>));
      }
    });
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
    if (wordBreak) {
      classes += ` text-${wordBreak}`;
    }

    if (textTight) {
      classes += ' text-tight';
    }

    if (isBlurred) {
      classes += ' text-isBlurred';
    }

    if (allowNewLines) {
      /**
       * This is added since to all newlines are replaced by us in <br>
       * There was a bug where if this flag was set AND google translated AND fullstory was present
       * Full-story would crash the application
       * */
      classes += ' notranslate';
    }

    /**
     * This class is added just for GOOGLE to not translate the text
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
      styles.whiteSpace = textWrap === 'wrap' ? 'unset' : 'nowrap';
      styles.overflow = 'hidden';
      styles.textOverflow = 'ellipsis';
      styles.wordBreak = props.wordBreak || 'break-word';
      styles.maxWidth = maxWidth || '100%';
    }

    if (display) {
      styles.display = display;
    }

    return styles;
  };

  /**
   * FN: Toggle Expanded
   * -------------------------------------------------------------------------------------------------------------------
   */
  const toggleExpanded = () => {
    if (typeof seeMore === 'object' && !seeMoreVisible) {
      return;
    }
    setExpanded((prevExpanded) => !prevExpanded);
  };
  /**
   * FN: Get Content Prop
   * -------------------------------------------------------------------------------------------------------------------
   */
  const boldAndTranslated = (text: string) => {
    return <b style={{ cursor: 'pointer' }}>{translationService.get(text).value}</b>;
  };
  const getContentProp = () => {
    /**
     * Idea is that we want to be able to push html to Text's children.
     * Ex: <Text>I am <b>Bold</b></Text>
     */
    if (allowNewLines && typeof translated === 'string' && !seeMore) {
      translated = translated.replaceAll('\n', '<br>');
    }

    if (typeof translated === 'string') {
      const content: any = sanitizeHTMLToReactNode(translated as string);
      if (typeof seeMore === 'boolean' && seeMore) {
        const seeMoreText = expanded ? boldAndTranslated('See Less') : boldAndTranslated('See More');
        const truncatedText = expanded ? translated : `${translated.slice(0, maxChar)}...`;
        if (showSeeMore) {
          content.children = (
            <>
              {sanitizeHTMLToReactNode(truncatedText).children} <a onClick={toggleExpanded}>{seeMoreText}</a>
            </>
          );
        }
      } else if (
        //@ts-ignore
        seeMoreVisible &&
        //@ts-ignore
        seeMore.seeMoreContent &&
        maxLines
      ) {
        if (seeMore) {
          content.children = (
            <span className={'see-more'} style={{ WebkitLineClamp: maxLines }}>
              {sanitizeHTMLToReactNode(translated).children}
              {translated.length > 100 && (
                <span className={'see-more-content'}>
                  {
                    //@ts-ignore
                    seeMoreVisible && seeMore.seeMoreContent
                  }
                </span>
              )}
            </span>
          );
        }
      } else if (
        (seeMoreVisible &&
          //@ts-ignore
          seeMore.seeMoreContent &&
          //@ts-ignore
          seeMore.seeLessContent) ||
        (typeof seeMore === 'object' && seeMore.seeMoreVisible === false)
      ) {
        if (expanded) {
          if (seeMore) {
            content.children = (
              <span onClick={toggleExpanded}>
                {sanitizeHTMLToReactNode(translated).children}{' '}
                {
                  // @ts-ignore
                  seeMoreVisible && seeMore.seeLessContent
                }
              </span>
            );
          }
        } else {
          const truncatedText = typeof translated === 'string' ? `${translated.slice(0, maxChar)}...` : translated;
          if (showSeeMore) {
            content.children = (
              <span onClick={toggleExpanded}>
                {
                  // @ts-ignore
                  truncatedText
                }
                {seeMoreVisible &&
                  //@ts-ignore
                  seeMore.seeMoreContent}
              </span>
            );
          }
        }
      } else {
        // console.warn("Invalid seeMore configuration. See more does not work on non-text children");
      }

      if (!!animateWords) {
        content.children = applyWordAnimation(translated, animateWords);
      }

      return content;
    }

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
                target: linkElement.target,
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
                role: 'link',
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
        <HeadingName
          data-testid={testId}
          className={getClasses()}
          style={getStyles()}
          {...getContentProp()}
          {...rest}
        />
      </TextWrapBalancer>
    );
  }

  /**
   * Display texts
   */
  if (type.indexOf('display') >= 0) {
    return (
      <TextWrapBalancer balanced={balanced}>
        <h1 data-testid={testId} className={getClasses()} style={getStyles()} {...getContentProp()} {...rest} />
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
        {...rest}
      />
    </TextWrapBalancer>
  );
};
