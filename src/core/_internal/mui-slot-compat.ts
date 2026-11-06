import { mergeSlotProps } from '@mui/material';

/** Match MUI's legacy fallback followed by explicit slotProps precedence. */
export function mapLegacySlots<T extends object>(
  props: T,
  mapping: Record<string, string>,
  components: Record<string, string> = {},
): T {
  const result = { ...props } as Record<string, unknown>;
  const legacy: Record<string, unknown> = {};
  for (const [key, slot] of Object.entries(mapping)) {
    if (key in result) legacy[slot] = result[key];
    delete result[key];
  }
  if (Object.keys(components).length) {
    const legacyComponents: Record<string, unknown> = {};
    for (const [key, slot] of Object.entries(components)) {
      if (key in result) legacyComponents[slot] = result[key];
      delete result[key];
    }
    result.slots = { ...legacyComponents, ...(result.slots as object) };
  }
  result.slotProps = { ...legacy, ...(result.slotProps as object) };
  return result as T;
}

/** Normalize the public legacy components/componentsProps bags without replacing default slots. */
export function mapLegacyComponentAliases<T extends object>(props: T): T {
  const result = { ...props } as Record<string, unknown>;
  const components = result.components as Record<string, unknown> | undefined;
  if (components) {
    const slots = Object.fromEntries(
      Object.entries(components).map(([name, component]) => [name[0].toLowerCase() + name.slice(1), component]),
    );
    result.slots = { ...slots, ...(result.slots as object) };
  }
  if ('componentsProps' in result) {
    result.slotProps = { ...(result.componentsProps as object), ...(result.slotProps as object) };
  }
  delete result.components;
  delete result.componentsProps;
  return result as T;
}

/** Menu/Popover root slot props target Modal: keep its renderer and map only its DOM slots. */
export function mapLegacyModalAliases<T extends object>(props: T): T {
  const result = { ...props } as Record<string, unknown>;
  const disableEscapeKeyDown = result.disableEscapeKeyDown === true;
  if (!('components' in result) && !('componentsProps' in result) && !('disableEscapeKeyDown' in result))
    return result as T;
  const legacy = mapLegacyComponentAliases({
    components: result.components,
    componentsProps: result.componentsProps,
  }) as { slots?: object; slotProps?: object };
  const slotProps = (result.slotProps ?? {}) as Record<string, unknown>;
  const root = slotProps.root;
  const hasBackdrop = (value: any) => value && Object.hasOwn(value, 'backdrop');
  const mapRoot = (resolved: any, state?: any) => {
    const legacyProps = legacy.slotProps as any;
    let backdrop = legacyProps?.backdrop;
    // Preserve public slot precedence and the owner state at each component boundary.
    if (hasBackdrop(slotProps) || !hasBackdrop(legacyProps)) {
      const topBackdrop = state?.slotProps?.backdrop;
      backdrop = typeof topBackdrop === 'function' ? () => topBackdrop(state) : topBackdrop;
    }
    if (hasBackdrop(resolved?.slotProps)) backdrop = resolved.slotProps.backdrop;
    return {
      ...resolved,
      slots: { ...legacy.slots, ...resolved?.slots },
      slotProps: {
        ...legacy.slotProps,
        ...resolved?.slotProps,
        // Popover supplies this default before root slot props; retain it when adding Modal slots.
        backdrop: mergeSlotProps(backdrop, { invisible: true }),
      },
      ...(disableEscapeKeyDown
        ? {
            // Capture the effective Menu handler, including Select's internal close handler.
            onClose: (event: unknown, reason: string) => {
              if (reason === 'escapeKeyDown') return;
              (resolved?.onClose ?? state?.onClose)?.(event, reason);
            },
          }
        : {}),
    };
  };
  result.slotProps = {
    ...slotProps,
    root: (state: unknown) => mapRoot(typeof root === 'function' ? root(state) : root, state),
  };
  delete result.components;
  delete result.componentsProps;
  delete result.disableEscapeKeyDown;
  return result as T;
}
