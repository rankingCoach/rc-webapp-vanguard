import type React from 'react';

/**
 * `sx` compatibility for components that used to be MUI-backed. The prop keeps accepting every shape MUI's SxProps
 * accepted (object, theme callback, array), so consumer code still type-checks. Runtime support is limited to what
 * maps 1:1 to inline style: a flat object of CSS properties (string/number values). Theme callbacks, arrays, nested
 * selectors, breakpoint objects and MUI spacing/shorthand keys (m, p, mt, bgcolor, …) are ignored with a dev warning.
 * Listed as an API delta for approval; no Vanguard or rc-webapp call site uses sx on migrated components.
 */
export type SxCompat =
  | React.CSSProperties
  | Record<string, unknown>
  | ((theme: unknown) => unknown)
  | ReadonlyArray<boolean | Record<string, unknown> | ((theme: unknown) => unknown)>
  | null
  | undefined;

const MUI_SHORTHAND = /^(m|p)[trblxy]?$|^(bgcolor|displayPrint)$/;

const isDev = () => {
  try {
    return import.meta.env?.MODE !== 'production';
  } catch {
    return false;
  }
};

export const sxToStyle = (sx: SxCompat, component: string): React.CSSProperties | undefined => {
  if (sx == null) return undefined;
  const unsupported = (why: string) => {
    if (isDev()) console.warn(`Vanguard ${component}: sx ${why} is not supported since MUI was removed; ignored.`);
    return undefined;
  };
  if (typeof sx === 'function') return unsupported('theme callback');
  if (Array.isArray(sx)) return unsupported('array');
  const style: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(sx as Record<string, unknown>)) {
    if (MUI_SHORTHAND.test(key)) {
      unsupported(`shorthand "${key}"`);
    } else if (typeof value === 'string' || typeof value === 'number') {
      style[key] = value;
    } else {
      unsupported(`nested/responsive value for "${key}"`);
    }
  }
  return style as React.CSSProperties;
};
