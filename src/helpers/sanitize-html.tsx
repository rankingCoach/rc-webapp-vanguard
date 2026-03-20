import render from 'dom-serializer';
import { ChildNode, Element } from 'domhandler';
import parseHtml, { domToReact, HTMLReactParserOptions } from 'html-react-parser';
import { parseDocument } from 'htmlparser2';
import React, { createElement, FC, Fragment, HTMLAttributes, ReactNode, useCallback } from 'react';

export interface Props {
  children: TagMap;
  html: string;
  acceptUnknown?: boolean;
}

export type TagMap = {
  [tag in keyof Partial<React.JSX.IntrinsicElements>]: FC<React.JSX.IntrinsicElements[tag]> | null;
};

const HtmlMapper: FC<Props> = ({ children: tagMap, html, acceptUnknown }) => {
  const renderNode = useCallback(
    <N extends keyof React.JSX.IntrinsicElements, A = React.JSX.IntrinsicElements[N]>(
      name: N,
      props: A,
      index: number,
      children: ReactNode,
    ) => {
      // Ensure 'name' is always treated as a string here, might need additional validation
      if (!name || typeof name !== 'string') {
        return <Fragment key={index}>{children}</Fragment>;
      }

      const Renderer = tagMap[name] as FC<A & { index: number }> | null | undefined;

      // eslint-disable-next-line react/no-children-prop
      const defaultRenderer = () => createElement(name, { ...props, children, key: index });

      if (Renderer === null) {
        return defaultRenderer();
      }

      if (typeof Renderer === 'undefined') {
        return acceptUnknown ? defaultRenderer() : null;
      }

      return (
        <Renderer {...props} index={index} key={index}>
          {children}
        </Renderer>
      );
    },
    [acceptUnknown, tagMap],
  );

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        const name = domNode.tagName.toLowerCase() as keyof React.JSX.IntrinsicElements;
        const props = { ...domNode.attribs };
        const children = domToReact(domNode.children, options);
        return renderNode(name, props, Math.random(), children); // Using Math.random() for key, consider a more stable key for production
      }
    },
  };

  return <>{parseHtml(html, options)}</>;
};

export default HtmlMapper;

/**
 * Sanitize and encode all HTML in a user-submitted string, returning React nodes.
 * https://portswigger.net/web-security/cross-site-scripting/preventing
 * @param  {String} str  The user-submitted string
 * @return {{ children: ReactNode }}  The sanitized content as React nodes
 */
export const sanitizeHTMLToReactNode = function (str: string | []): { children: any } {
  if (!str) return { children: null };

  if (typeof str !== 'string') {
    return str as any;
  }

  return {
    children: (
      <HtmlMapper html={str}>
        {{
          br: () => <br />,
          b: (props) => <b {...props} />,
          em: (props) => <em {...props} />,
          link: (props: HTMLAttributes<HTMLLinkElement>) => <link {...props} />,
          span: (props) => <span {...props} />,
        }}
      </HtmlMapper>
    ),
  };
};

/**
 * sanitizeHtml - Options
 */
export interface SanitizeHtmlOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  allowedClasses?: string[];
}

const REMOVED_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'noscript']);

const DEFAULT_ALLOWED_TAGS = new Set([
  'a',
  'abbr',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'thead',
  'tbody',
  'td',
  'th',
  'tr',
  'u',
  'ul',
]);

const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'name', 'target', 'rel'],
};

const DANGEROUS_URL_PATTERN = /^\s*(javascript|vbscript|data)\s*:/i;
const URL_ATTRIBUTES = new Set(['href', 'src', 'action', 'formaction', 'xlink:href']);

function isAllowedAttribute(
  tagName: string,
  attrName: string,
  attrValue: string,
  allowedAttributes: Record<string, string[]>,
): boolean {
  if (attrName.toLowerCase().startsWith('on')) return false;
  if (URL_ATTRIBUTES.has(attrName) && DANGEROUS_URL_PATTERN.test(attrValue)) return false;

  const tagAllowed = allowedAttributes[tagName];
  if (!tagAllowed) return false;
  return tagAllowed.includes(attrName);
}

function cleanNodes(
  nodes: ChildNode[],
  allowedTags: Set<string>,
  allowedAttributes: Record<string, string[]>,
  allowedClasses?: Set<string>,
): ChildNode[] {
  const result: ChildNode[] = [];

  for (const node of nodes) {
    if (node.type === 'text') {
      result.push(node);
      continue;
    }

    if (node.type === 'comment') {
      continue;
    }

    if (node instanceof Element) {
      const tagName = node.tagName.toLowerCase();

      if (REMOVED_TAGS.has(tagName)) {
        continue;
      }

      const cleanedChildren = cleanNodes(node.children, allowedTags, allowedAttributes, allowedClasses);

      if (!allowedTags.has(tagName)) {
        result.push(...cleanedChildren);
        continue;
      }

      const filteredAttribs: Record<string, string> = {};
      for (const [attr, value] of Object.entries(node.attribs)) {
        if (isAllowedAttribute(tagName, attr, value, allowedAttributes)) {
          filteredAttribs[attr] = value;
        }
      }

      if (allowedClasses && 'class' in filteredAttribs) {
        const filtered = filteredAttribs['class']
          .split(/\s+/)
          .filter((cls) => cls && allowedClasses.has(cls))
          .join(' ');
        if (filtered) {
          filteredAttribs['class'] = filtered;
        } else {
          delete filteredAttribs['class'];
        }
      }

      node.attribs = filteredAttribs;
      node.children = cleanedChildren;
      result.push(node);
    }
  }

  return result;
}

/**
 * Sanitize HTML string by stripping dangerous tags, attributes, and URL schemes.
 * @param dirty - The untrusted HTML string
 * @param options - Optional configuration for allowed tags and attributes
 * @returns A sanitized HTML string
 */
export function sanitizeHtml(dirty: string, options?: SanitizeHtmlOptions): string {
  if (!dirty) return '';

  const allowedTags = options?.allowedTags ? new Set(options.allowedTags) : DEFAULT_ALLOWED_TAGS;
  const allowedAttributes = options?.allowedAttributes ?? DEFAULT_ALLOWED_ATTRIBUTES;
  const allowedClasses = options?.allowedClasses ? new Set(options.allowedClasses) : undefined;

  const doc = parseDocument(dirty);
  doc.children = cleanNodes(doc.children, allowedTags, allowedAttributes, allowedClasses);

  return render(doc);
}
