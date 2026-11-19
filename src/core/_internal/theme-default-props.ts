// Ported from @mui/material@9.5.0 styles/useThemeProps.js, @mui/system useThemeProps / getThemeProps /
// useThemeWithoutDefault and @mui/utils resolveProps (MIT)
import { ThemeContext } from '@emotion/react';
import { useContext } from 'react';

type AnyProps = Record<string, unknown>;

/** @mui/utils resolveProps (mergeClassNameAndStyle = false, as getThemeProps calls it). */
export const resolveProps = <P extends AnyProps>(defaultProps: AnyProps, props: P): P => {
  const output: AnyProps = { ...props };
  for (const key in defaultProps) {
    if (!Object.hasOwn(defaultProps, key)) continue;
    if (key === 'components' || key === 'slots') {
      output[key] = { ...(defaultProps[key] as AnyProps), ...(output[key] as AnyProps) };
    } else if (key === 'componentsProps' || key === 'slotProps') {
      const defaultSlotProps = defaultProps[key] as AnyProps | undefined;
      const slotProps = props[key] as AnyProps | undefined;
      if (!slotProps) output[key] = defaultSlotProps || {};
      else if (!defaultSlotProps) output[key] = slotProps;
      else {
        const merged: AnyProps = { ...slotProps };
        for (const slotKey in defaultSlotProps) {
          if (!Object.hasOwn(defaultSlotProps, slotKey)) continue;
          const defaultValue = defaultSlotProps[slotKey];
          const value = slotProps[slotKey];
          if (typeof defaultValue === 'function' || typeof value === 'function') {
            // Function slot props resolve later (with ownerState): defer the merge so neither side is dropped.
            merged[slotKey] = (...args: unknown[]) =>
              resolveProps(
                ((typeof defaultValue === 'function' ? defaultValue(...args) : defaultValue) ?? {}) as AnyProps,
                ((typeof value === 'function' ? value(...args) : value) ?? {}) as AnyProps,
              );
          } else {
            merged[slotKey] = resolveProps((defaultValue ?? {}) as AnyProps, (value ?? {}) as AnyProps);
          }
        }
        output[key] = merged;
      }
    } else if (output[key] === undefined) {
      output[key] = defaultProps[key];
    }
  }
  return output as P;
};

const isObjectEmpty = (obj: object) => Object.keys(obj).length === 0;

/**
 * MUI 9.5 `useThemeProps({ props, name })` (@mui/material/styles) without importing MUI: reads the same emotion
 * ThemeContext MUI's ThemeProvider writes (theme or the scoped `$$material` theme), takes
 * `theme.components[name].defaultProps` and merges them with MUI's resolveProps rules. No provider → props unchanged
 * (MUI's default theme has no component defaults). Plan §36.2 B.3 option 5.3: the own routes stay free of @mui/* in
 * their eager graph and keep MUI's theme-default behaviour.
 */
export const useThemeDefaultProps = <P extends AnyProps>(props: P, name: string): P => {
  const contextTheme = useContext(ThemeContext) as AnyProps | null;
  let theme = !contextTheme || isObjectEmpty(contextTheme) ? null : contextTheme;
  if (theme) theme = (theme.$$material as AnyProps | undefined) || theme;
  const defaults = (theme?.components as Record<string, { defaultProps?: AnyProps }> | undefined)?.[name]?.defaultProps;
  return defaults ? resolveProps(defaults, props) : props;
};
