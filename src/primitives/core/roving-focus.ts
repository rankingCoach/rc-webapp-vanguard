/**
 * Roving focus behavior (framework-free): arrow keys / Home / End move DOM focus between the container's
 * `[data-roving-item]` elements, wrapping and skipping disabled ones. It never changes tab stops or selection.
 * Events whose target is not a roving item (e.g. an input nested in the group) are left alone.
 */
export type Orientation = 'horizontal' | 'vertical';

export interface RovingFocusOptions {
  container: HTMLElement;
  orientation: Orientation;
  rtl?: boolean;
  wrap?: boolean;
}

export interface RovingKeyEvent {
  key: string;
  target: EventTarget | null;
  defaultPrevented: boolean;
  altKey: boolean;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  preventDefault: () => void;
}

export const ROVING_ITEM_ATTR = 'data-roving-item';

const isFocusable = (el: HTMLElement) =>
  !(el as HTMLButtonElement).disabled && el.getAttribute('aria-disabled') !== 'true';

const step = (list: HTMLElement[], from: number, direction: 1 | -1, wrap: boolean) => {
  for (let n = 1; n <= list.length; n++) {
    let i = from + direction * n;
    if (i < 0 || i >= list.length) {
      if (!wrap) return null;
      i = (i + list.length) % list.length;
    }
    if (isFocusable(list[i])) return list[i];
  }
  return null;
};

export const rovingFocusKeyDown = (event: RovingKeyEvent, options: RovingFocusOptions): void => {
  const { container, orientation, rtl = false, wrap = true } = options;
  if (event.defaultPrevented || event.altKey || event.shiftKey || event.ctrlKey || event.metaKey) return;
  const list = Array.from(container.querySelectorAll<HTMLElement>(`[${ROVING_ITEM_ATTR}]`));
  const current = list.indexOf(event.target as HTMLElement);
  if (current === -1) return;

  let prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
  let nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
  if (orientation === 'horizontal' && rtl) [prevKey, nextKey] = [nextKey, prevKey];

  let target: HTMLElement | null;
  switch (event.key) {
    case nextKey:
      target = step(list, current, 1, wrap);
      break;
    case prevKey:
      target = step(list, current, -1, wrap);
      break;
    case 'Home':
      target = step(list, -1, 1, false);
      break;
    case 'End':
      target = step(list, list.length, -1, false);
      break;
    default:
      return;
  }
  event.preventDefault();
  target?.focus();
};
