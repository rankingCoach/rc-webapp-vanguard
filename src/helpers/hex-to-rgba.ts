// Ported from @mui/system@9.5.0 colorManipulator/colorManipulator.js hexToRgb (MIT)

/** Converts '#rgb' / '#rgba' / '#rrggbb' / '#rrggbbaa' to 'rgb(r, g, b)' / 'rgba(r, g, b, a)' (MUI hexToRgb). */
export const hexToRgb = (hexColor: string): string => {
  const color = hexColor.slice(1);
  const re = new RegExp(`.{1,${color.length >= 6 ? 2 : 1}}`, 'g');
  let colors: string[] | null = color.match(re);
  if (colors && colors[0].length === 1) colors = colors.map((n) => n + n);
  if (!colors) return '';
  const values = colors.map((n, index) =>
    index < 3 ? parseInt(n, 16) : Math.round((parseInt(n, 16) / 255) * 1000) / 1000,
  );
  return `rgb${colors.length === 4 ? 'a' : ''}(${values.join(', ')})`;
};

/** Converts '#rgb' / '#rrggbb' to 'rgba(r, g, b,alpha)'. */
export const hexToRgba = (hexColor: string, alpha: number) => {
  const rgb = hexToRgb(hexColor);
  const rgba = rgb.replace('rgb', 'rgba').replace(')', `,${alpha})`);
  return rgba;
};
