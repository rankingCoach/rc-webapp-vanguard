import { hexToRgb as muiHexToRgb } from '@mui/system';

/** Converts '#rgb' / '#rrggbb' to 'rgb(r, g, b)'. */
export const hexToRgb = (hexColor: string): string => muiHexToRgb(hexColor);

/** Converts '#rgb' / '#rrggbb' to 'rgba(r, g, b,alpha)'. */
export const hexToRgba = (hexColor: string, alpha: number) => {
  const rgb = hexToRgb(hexColor);
  const rgba = rgb.replace('rgb', 'rgba').replace(')', `,${alpha})`);
  return rgba;
};
