/**
 * Textarea autosize maths (framework-free), identical to MUI TextareaAutosize: the content height measured on a
 * hidden shadow textarea, clamped to [minRows, maxRows] rows of `singleRowHeight` (never below one row), plus
 * padding + border for border-box. `overflowing` = the clamped height still (nearly) equals the content height.
 */
export interface AutosizeInput {
  innerHeight: number;
  singleRowHeight: number;
  minRows?: number | string;
  maxRows?: number | string;
  padding: number;
  border: number;
  boxSizing: string;
}

export const autosizeHeight = (input: AutosizeInput): { outerHeightStyle: number; overflowing: boolean } => {
  const { innerHeight, singleRowHeight, minRows, maxRows, padding, border, boxSizing } = input;
  let outerHeight = innerHeight;
  if (minRows) outerHeight = Math.max(Number(minRows) * singleRowHeight, outerHeight);
  if (maxRows) outerHeight = Math.min(Number(maxRows) * singleRowHeight, outerHeight);
  outerHeight = Math.max(outerHeight, singleRowHeight);
  const outerHeightStyle = outerHeight + (boxSizing === 'border-box' ? padding + border : 0);
  const overflowing = Math.abs(outerHeight - innerHeight) <= 1;
  return { outerHeightStyle, overflowing };
};

/** `parseInt(value) || 0`, as MUI reads computed lengths. */
export const styleNumber = (value: string | null | undefined): number => parseInt(value ?? '', 10) || 0;
