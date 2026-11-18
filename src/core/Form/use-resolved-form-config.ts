import type { FormConfigElement } from '@custom-hooks/useFormConfig';
import { useEffect } from 'react';
import { useFormConfigContext } from './FormConfigContext';
import { useFormElementBinding } from './FormElement/FormElement';

const isDev = () => {
  try {
    return import.meta.env?.MODE !== 'production';
  } catch {
    return false;
  }
};

const noop = () => undefined;

/**
 * F3: the formconfig an input works with.
 * - `formconfig` prop given: returned unchanged (legacy path; child-walking Form already enriched it). If `field` is
 *   also given, `formconfig` wins and a dev warning is logged.
 * - `field` given and the nearest Form's config has that key: the field is bound through context with the same
 *   per-field logic FormElement uses (`useFormElementBinding`) and reports to that Form, at any depth, with no
 *   prop drilling. Array fields take the explicit `index`.
 * - otherwise (no Form above, unknown key): undefined, the input behaves as a plain (un)controlled input, and a dev
 *   warning is logged.
 */
export const useResolvedFormConfig = (
  formconfig: FormConfigElement | undefined,
  field: string | undefined,
  index?: number,
): FormConfigElement | undefined => {
  const ctx = useFormConfigContext();
  const fromProp = Boolean(formconfig);
  const source = !fromProp && field ? (ctx?.formConfig?.[field] as FormConfigElement | undefined) : undefined;
  const childConfig = Object.assign({}, source) as FormConfigElement;
  const api = ctx?.fieldApi;
  const bound = useFormElementBinding({
    active: Boolean(source),
    childConfig,
    formConfig: ctx?.formConfig,
    idx: index,
    onChange: api?.onChange ?? noop,
    onBlur: api?.onBlur ?? noop,
    childAdded: api?.childAdded,
    childRemoved: api?.childRemoved,
  });

  useEffect(() => {
    if (!isDev() || !field) return;
    if (fromProp) {
      console.warn(`Vanguard: both \`formconfig\` and \`field="${field}"\` were given; \`formconfig\` wins.`);
    } else if (!ctx?.formConfig) {
      console.warn(`Vanguard: \`field="${field}"\` has no <Form config> above it; the input is not bound.`);
    } else if (!source) {
      console.warn(`Vanguard: \`field="${field}"\` is not a key of the nearest Form's config; the input is not bound.`);
    }
  }, [field, fromProp, ctx?.formConfig, source]);

  if (fromProp) return formconfig;
  return source ? bound : undefined;
};
