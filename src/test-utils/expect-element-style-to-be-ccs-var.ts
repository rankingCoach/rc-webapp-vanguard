import { expect } from 'storybook/test';

export const getRootStyleForCssValue = (cssVal: string): string => {
  const rootStyle = getComputedStyle(document.documentElement);
  return rootStyle.getPropertyValue(cssVal).replace(/["']/g, '').trim();
};

export const hexToRgba = (hex: string): [number, number, number, number] => {
  let r = 0,
    g = 0,
    b = 0,
    a = 1;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  } else if (hex.length === 9) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
    a = parseInt(hex[7] + hex[8], 16) / 255;
  }
  return [r, g, b, a];
};

export const rgbaToRgba = (rgba: string): [number, number, number, number] => {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*(\d*\.?\d+)?\)/);
  if (!match) throw new Error('Invalid RGBA color format');
  const [, r, g, b, a = '1'] = match;
  return [parseInt(r), parseInt(g), parseInt(b), parseFloat(a)];
};

export const hslToRgba = (hsl: string): [number, number, number, number] => {
  const match = hsl.match(/hsla?\((\d+(?:\.\d+)?)(?:deg)?,\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%,?\s*(\d*\.?\d+)?\)/);
  if (!match) throw new Error('Invalid HSL color format');
  const [, h, s, l, a = '1'] = match;

  const hue = parseFloat(h) / 360;
  const saturation = parseFloat(s) / 100;
  const lightness = parseFloat(l) / 100;
  const alpha = parseFloat(a);

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (saturation === 0) {
    r = g = b = lightness; // achromatic
  } else {
    const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;
    r = hue2rgb(p, q, hue + 1 / 3);
    g = hue2rgb(p, q, hue);
    b = hue2rgb(p, q, hue - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), alpha];
};

export const compareColors = (color1: string, color2: string): boolean => {
  const parseColor = (color: string): [number, number, number, number] => {
    if (color.startsWith('#')) {
      return hexToRgba(color);
    } else if (color.startsWith('rgb')) {
      return rgbaToRgba(color);
    } else if (color.startsWith('hsl')) {
      return hslToRgba(color);
    }
    // throw new Error("Unsupported color format:: "+ color);
    return [-1, -1, -1, -1];
  };

  const [r1, g1, b1, a1] = parseColor(color1);
  const [r2, g2, b2, a2] = parseColor(color2);
  if (a1 === 0 && a2 === 0) {
    return true;
  }

  return r1 === r2 && g1 === g2 && b1 === b2 && a1 === a2;
};

export const expectElementValueToBeCssVar = async (el: HTMLElement, prop: string, cssValue: string): Promise<void> => {
  const getComputedStyleForProp = (element: HTMLElement, property: string): string => {
    return getComputedStyle(element).getPropertyValue(property).trim();
  };

  const getRootOrElementStyleForCssValue = (value: string, element: HTMLElement): string => {
    const rootStyle = getComputedStyle(document.documentElement).getPropertyValue(value).trim();
    return rootStyle || getComputedStyle(element).getPropertyValue(value).trim();
  };

  const resolveCssVarForProp = (value: string, property: string, element: HTMLElement): string => {
    const probe = document.createElement('span');
    probe.style.setProperty('position', 'absolute');
    probe.style.setProperty('visibility', 'hidden');
    probe.style.setProperty(property, `var(${value})`);

    element.appendChild(probe);
    const resolved = getComputedStyleForProp(probe, property);
    element.removeChild(probe);

    return resolved;
  };

  const computed = getComputedStyleForProp(el, prop);

  const root = getRootOrElementStyleForCssValue(cssValue, el);
  const resolvedRoot = resolveCssVarForProp(cssValue, prop, el) || root;

  const areEqual = compareColors(resolvedRoot, computed);

  return await expect(areEqual, `Expected ${cssValue}(${root}) to resolve to ${computed}`).toBe(true);
};
