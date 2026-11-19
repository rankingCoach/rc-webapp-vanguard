/**
 * DOM measurement for anchored placement (plan §27, watchdog MAJOR 1): a port of popper.js 2.11's dom-utils that
 * matter for MUI Popper: clipping parents (overflow-clipping ancestors intersected with the viewport), the offset
 * parent / containing block (transformed ancestors), composite rects (offset-parent coordinates incl. scroll) and
 * the scroll parents to listen to. The pure core (core/anchored-placement.ts) consumes the resulting rects.
 */
import type { Rect } from '../../core/anchored-placement';

type Win = Window & typeof globalThis;

const nodeName = (node: Node | Window | null | undefined) =>
  node && 'nodeName' in node && node.nodeName ? node.nodeName.toLowerCase() : null;
const getWindow = (node: Node | Window): Win => {
  if (node == null) return window as Win;
  if (String(node) === '[object Window]') return node as Win;
  return ((node as Node).ownerDocument?.defaultView ?? window) as Win;
};
const isElement = (n: unknown): n is Element => n instanceof getWindow(n as Node).Element || n instanceof Element;
const isHTMLElement = (n: unknown): n is HTMLElement =>
  n instanceof getWindow(n as Node).HTMLElement || n instanceof HTMLElement;
const isShadowRoot = (n: unknown): n is ShadowRoot =>
  typeof ShadowRoot !== 'undefined' && (n instanceof getWindow(n as Node).ShadowRoot || n instanceof ShadowRoot);
const css = (el: Element) => getWindow(el).getComputedStyle(el);
const docEl = (node: Node | Window) =>
  ((isElement(node) ? node.ownerDocument : (node as Window).document) ?? document).documentElement;
const isFirefox = () => typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);

export const getParentNode = (el: Node): Node => {
  if (nodeName(el) === 'html') return el;
  return (
    (el as Element & { assignedSlot?: Node | null }).assignedSlot ||
    el.parentNode ||
    (isShadowRoot(el) ? el.host : null) ||
    docEl(el)
  );
};

const isScrollParent = (el: Element) => {
  const { overflow, overflowX, overflowY } = css(el);
  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
};

const getScrollParent = (node: Node): HTMLElement => {
  if (['html', 'body', '#document'].includes(nodeName(node) ?? '')) return (node.ownerDocument ?? document).body;
  if (isHTMLElement(node) && isScrollParent(node)) return node;
  return getScrollParent(getParentNode(node));
};

/** Every element (and window/visualViewport) whose scroll can move the anchor or the floating element. */
export const listScrollParents = (element: Node, list: (Element | Window | VisualViewport)[] = []) => {
  const scrollParent = getScrollParent(element);
  const isBody = scrollParent === element.ownerDocument?.body;
  const win = getWindow(scrollParent);
  const target: (Element | Window | VisualViewport)[] = isBody
    ? [
        win,
        ...(win.visualViewport ? [win.visualViewport] : []),
        ...(isScrollParent(scrollParent) ? [scrollParent] : []),
      ]
    : [scrollParent];
  const updated = list.concat(target);
  return isBody ? updated : updated.concat(listScrollParents(getParentNode(scrollParent)));
};

const getContainingBlock = (el: Element): HTMLElement | null => {
  let node: Node | null = getParentNode(el);
  if (isShadowRoot(node)) node = node.host;
  while (isHTMLElement(node) && !['html', 'body'].includes(nodeName(node) ?? '')) {
    const s = css(node);
    if (
      s.transform !== 'none' ||
      s.perspective !== 'none' ||
      s.contain === 'paint' ||
      ['transform', 'perspective'].includes(s.willChange) ||
      (isFirefox() && s.willChange === 'filter') ||
      (isFirefox() && s.filter && s.filter !== 'none')
    ) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
};

const trueOffsetParent = (el: Element): Element | null =>
  !isHTMLElement(el) || css(el).position === 'fixed' ? null : el.offsetParent;

const isTable = (el: Element) => ['table', 'td', 'th'].includes(nodeName(el) ?? '');

/** popper getOffsetParent: the positioned ancestor (or containing block, or window) the floating element sits in. */
export const getOffsetParent = (el: Element): Element | Win => {
  const win = getWindow(el);
  let parent = trueOffsetParent(el);
  while (parent && isTable(parent) && css(parent).position === 'static') parent = trueOffsetParent(parent);
  if (parent && (nodeName(parent) === 'html' || (nodeName(parent) === 'body' && css(parent).position === 'static'))) {
    return win;
  }
  return parent || getContainingBlock(el) || win;
};

const scrollbarX = (el: Element) =>
  // popper getWindowScrollBarX: html's left + window scrollLeft
  docEl(el).getBoundingClientRect().left + getWindow(el).scrollX;

const clientRect = (el: Element | { getBoundingClientRect: () => DOMRect }, includeScale = false) => {
  const r = el.getBoundingClientRect();
  let sx = 1;
  let sy = 1;
  if (includeScale && isHTMLElement(el)) {
    sx = el.offsetWidth > 0 ? Math.round(r.width) / el.offsetWidth || 1 : 1;
    sy = el.offsetHeight > 0 ? Math.round(r.height) / el.offsetHeight || 1 : 1;
  }
  const x = r.left / sx;
  const y = r.top / sy;
  const width = r.width / sx;
  const height = r.height / sy;
  return { x, y, width, height, top: y, left: x, right: x + width, bottom: y + height };
};

const viewportRect = (el: Element, strategy: 'absolute' | 'fixed') => {
  const win = getWindow(el);
  const html = docEl(el);
  const vv = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x = 0;
  let y = 0;
  if (vv) {
    width = vv.width;
    height = vv.height;
    // popper's isLayoutViewport() is false outside Safari; in Chromium visualViewport offsets only count for fixed.
    const layoutViewport = !/^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (layoutViewport || strategy === 'fixed') {
      x = vv.offsetLeft;
      y = vv.offsetTop;
    }
  }
  return { x: x + scrollbarX(el), y, width, height };
};

const innerRect = (el: Element) => {
  const r = clientRect(el);
  const top = r.top + el.clientTop;
  const left = r.left + el.clientLeft;
  return { x: left, y: top, width: el.clientWidth, height: el.clientHeight };
};

const clippingParents = (element: Element): Element[] => {
  const parents = listScrollParents(getParentNode(element));
  const canEscape = ['absolute', 'fixed'].includes(css(element).position);
  const clipper = canEscape && isHTMLElement(element) ? getOffsetParent(element) : element;
  if (!isElement(clipper)) return [];
  return parents.filter((p): p is Element => isElement(p) && p.contains(clipper) && nodeName(p) !== 'body');
};

/** popper getClippingRect(element, 'clippingParents', 'viewport', strategy): the visible area for overflow checks. */
export const getClippingRect = (element: Element, strategy: 'absolute' | 'fixed'): Rect => {
  const rects = [...clippingParents(element).map(innerRect), viewportRect(element, strategy)];
  let top = rects[0].y;
  let left = rects[0].x;
  let right = rects[0].x + rects[0].width;
  let bottom = rects[0].y + rects[0].height;
  for (const r of rects) {
    top = Math.max(r.y, top);
    left = Math.max(r.x, left);
    right = Math.min(r.x + r.width, right);
    bottom = Math.min(r.y + r.height, bottom);
  }
  return { x: left, y: top, width: right - left, height: bottom - top };
};

/**
 * popper getCompositeRect: `element`'s rect in the offset parent's coordinate system (scroll included), which is
 * the system the floating element's `translate(x, y)` is applied in.
 */
export const getCompositeRect = (
  element: Element | { getBoundingClientRect: () => DOMRect },
  offsetParent: Element | Win,
  isFixed: boolean,
): Rect => {
  const isParentElement = isHTMLElement(offsetParent);
  const html = isElement(offsetParent) ? docEl(offsetParent) : (offsetParent as Win).document.documentElement;
  const scaled =
    isParentElement &&
    (() => {
      const r = (offsetParent as HTMLElement).getBoundingClientRect();
      return (
        Math.round(r.width) / (offsetParent as HTMLElement).offsetWidth !== 1 ||
        Math.round(r.height) / (offsetParent as HTMLElement).offsetHeight !== 1
      );
    })();
  const rect = clientRect(element, Boolean(scaled));
  let scroll = { left: 0, top: 0 };
  let origin = { x: 0, y: 0 };
  if (isParentElement || !isFixed) {
    if (nodeName(offsetParent as Element) !== 'body' || isScrollParent(html)) {
      scroll = isHTMLElement(offsetParent)
        ? { left: offsetParent.scrollLeft, top: offsetParent.scrollTop }
        : { left: (offsetParent as Win).scrollX, top: (offsetParent as Win).scrollY };
    }
    if (isHTMLElement(offsetParent)) {
      const r = clientRect(offsetParent, true);
      origin = { x: r.x + offsetParent.clientLeft, y: r.y + offsetParent.clientTop };
    } else if (html) {
      origin = { x: scrollbarX(html), y: 0 };
    }
  }
  return {
    x: rect.left + scroll.left - origin.x,
    y: rect.top + scroll.top - origin.y,
    width: rect.width,
    height: rect.height,
  };
};

/**
 * popper `getLayoutRect` size: the client-rect size when it is within 1px of offsetWidth/offsetHeight (fractional
 * layout), else offsetWidth/offsetHeight (a transformed element).
 */
export const layoutSize = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  return {
    width: Math.abs(r.width - el.offsetWidth) <= 1 ? r.width : el.offsetWidth,
    height: Math.abs(r.height - el.offsetHeight) <= 1 ? r.height : el.offsetHeight,
  };
};
