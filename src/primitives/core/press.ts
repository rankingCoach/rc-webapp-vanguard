/**
 * Press behavior (framework-free): host attributes and keyboard activation for anything that acts as a button.
 * Native <button>/<a href> activate themselves; any other host gets role=button and a real click() from
 * Enter (keydown) and Space (keyup), so the click bubbles like a mouse click. Disabled hosts ignore input.
 */
export interface PressAttrsInput {
  native: boolean;
  disabled: boolean;
  tabIndex?: number;
  type?: string;
  hasFormAction?: boolean;
}

export const pressAttrs = ({ native, disabled, tabIndex = 0, type, hasFormAction = false }: PressAttrsInput) => {
  const attrs: Record<string, unknown> = { tabIndex: disabled ? -1 : tabIndex };
  if (native) {
    attrs.type = type === undefined && !hasFormAction ? 'button' : type;
    attrs.disabled = disabled;
  } else {
    attrs.role = 'button';
    if (disabled) attrs['aria-disabled'] = true;
  }
  return attrs;
};

export const hasNativeActivation = (el: Element | null, fallback: boolean): boolean => {
  if (!el) return fallback;
  if (el.tagName === 'BUTTON') return true;
  return el.tagName === 'A' && Boolean((el as HTMLAnchorElement).href);
};

interface KeyLike {
  key: string;
  target: EventTarget | null;
  currentTarget: EventTarget | null;
  defaultPrevented: boolean;
  preventDefault: () => void;
}

/** Call after consumer handlers. Returns true when it activated the host. */
export const pressKeyDown = (event: KeyLike, nativeActivation: boolean): boolean => {
  if (event.target !== event.currentTarget || nativeActivation) return false;
  if (event.key === ' ') {
    event.preventDefault();
    return false;
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    (event.currentTarget as HTMLElement).click();
    return true;
  }
  return false;
};

export const pressKeyUp = (event: KeyLike, nativeActivation: boolean): boolean => {
  if (event.target === event.currentTarget && !nativeActivation && event.key === ' ' && !event.defaultPrevented) {
    (event.currentTarget as HTMLElement).click();
    return true;
  }
  return false;
};

export const isFocusVisible = (el: Element): boolean => {
  try {
    return el.matches(':focus-visible');
  } catch {
    return false;
  }
};
