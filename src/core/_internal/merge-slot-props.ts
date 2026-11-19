// Ported from @mui/material@9.5.0 utils/mergeSlotProps.js and @mui/utils isEventHandler (MIT)
type AnyProps = Record<string, unknown> & { className?: string; style?: object; sx?: unknown };
type SlotProps = AnyProps | ((ownerState: AnyProps) => AnyProps) | undefined;

const isEventHandler = (key: string, value: unknown) => {
  const third = key.charCodeAt(2);
  return key[0] === 'o' && key[1] === 'n' && third >= 65 && third <= 90 && typeof value === 'function';
};

// clsx for strings: truthy parts joined by one space (no whitespace normalisation inside a part, as clsx).
const join = (...parts: unknown[]) => parts.filter((p) => typeof p === 'string' && p !== '').join(' ');

const extractHandlers = (external: AnyProps, defaults: AnyProps) => {
  const handlers: AnyProps = {};
  for (const key of Object.keys(defaults))
    if (isEventHandler(key, defaults[key]) && typeof external[key] === 'function')
      handlers[key] = (...args: unknown[]) => {
        (external[key] as (...a: unknown[]) => void)(...args);
        (defaults[key] as (...a: unknown[]) => void)(...args);
      };
  return handlers;
};

const toArray = (sx: unknown) => (Array.isArray(sx) ? sx : [sx]);

const merge = (defaults: AnyProps, external: AnyProps, ownerClassName?: unknown) => {
  const className = join(ownerClassName, defaults?.className, external?.className);
  const result: AnyProps = { ...defaults, ...external, ...extractHandlers(external, defaults) };
  if (className) result.className = className;
  if (defaults?.style && external?.style) result.style = { ...defaults.style, ...external.style };
  if (defaults?.sx && external?.sx) result.sx = [...toArray(defaults.sx), ...toArray(external.sx)];
  return result;
};

/**
 * MUI 9.5 `mergeSlotProps(externalSlotProps, defaultSlotProps)` without importing @mui/material (plan §36.2 B.3: the
 * eager graph of every export stays MUI-free): external wins, event handlers of both run (external first), classNames
 * joined, style and sx merged; function slot props resolve with the owner state as in MUI.
 */
export const mergeSlotProps = (externalSlotProps: SlotProps, defaultSlotProps: SlotProps): SlotProps => {
  if (!externalSlotProps) return defaultSlotProps;
  if (typeof externalSlotProps === 'function' || typeof defaultSlotProps === 'function')
    return (ownerState: AnyProps) => {
      const defaults = (
        typeof defaultSlotProps === 'function' ? defaultSlotProps(ownerState) : defaultSlotProps
      ) as AnyProps;
      const external = (
        typeof externalSlotProps === 'function' ? externalSlotProps({ ...ownerState, ...defaults }) : externalSlotProps
      ) as AnyProps;
      return merge(defaults, external, ownerState?.className);
    };
  return merge(defaultSlotProps as AnyProps, externalSlotProps);
};
