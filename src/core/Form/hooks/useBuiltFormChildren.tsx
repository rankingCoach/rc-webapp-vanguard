import { FormConfigElement } from '@custom-hooks/useFormConfig';
import React, { useMemo } from 'react';

import { FieldConfigProvider } from '../FormConfigContext';
import { ConfigWithInternal, RuntimeFieldBinding } from './form.types';
import {
  AUTO_BINDABLE_COMPONENTS,
  buildRuntimeBinding,
  cloneWithoutFormControl,
  extractFormConfigKey,
  getComponentName,
  resolveFieldName,
  resolveFieldType,
} from './form.utils';

type UseBuiltFormChildrenParams<T> = {
  children: React.ReactNode;
  config?: ConfigWithInternal<T>;
  getRuntimeConfig: (binding: RuntimeFieldBinding<T>) => FormConfigElement<T>;
  onValueChange: (
    runtimeConfig: FormConfigElement<T>,
    runtimeKey: string,
    args: any[],
    binding: RuntimeFieldBinding<T>,
  ) => void;
  onFieldBlur: (
    runtimeConfig: FormConfigElement<T>,
    runtimeKey: string,
    args: any[],
    binding: RuntimeFieldBinding<T>,
  ) => void;
};

export const useBuiltFormChildren = <T,>({
  children,
  config,
  getRuntimeConfig,
  onValueChange,
  onFieldBlur,
}: UseBuiltFormChildrenParams<T>) => {
  return useMemo(() => {
    // Array-field index tracking: keyed by field name so each repeated field gets its own counter
    const idxMap: Record<string, number> = {};
    // Active inputs for this render: keys are runtimeKeys (fieldName + optional idx)
    const activeInputs: Record<string, FormConfigElement<T>> = {};
    // Auto-index cursor advances only for legacy-fallback bindings (no explicit name prop)
    let autoConfigIndex = 0;

    /**
     * Injection matrix — the parent runtime decides which controlled props each child receives.
     * Priority: parent-derived values always win over child-embedded defaults.
     *
     * Supported control types and their injected props:
     *   PhoneNumberBase  → phoneNumberBase (value), phoneNumberBaseInputEvents.onChange
     *   Checkbox         → checked, onChange
     *   ColorPicker      → value (display-only; committed value is gated by hex validation), onChange
     *   All others       → value, onChange
     */
    const buildInjectedProps = (
      runtimeConfig: FormConfigElement<T>,
      runtimeKey: string,
      propsAsAny: Record<string, any>,
      binding: RuntimeFieldBinding<T>,
    ) => {
      const originalOnChange = propsAsAny.onChange;
      const originalOnBlur = propsAsAny.onBlur;

      // Base props always injected: field name identity + wrapped onChange
      const nextProps: Record<string, any> = {
        name: binding.fieldName,
        onChange: (...args: any[]) => {
          // Parent status update happens before calling the original child handler
          onValueChange(runtimeConfig, runtimeKey, args, binding);
          originalOnChange?.(...args);
        },
        onBlur: (...args: any[]) => {
          onFieldBlur(runtimeConfig, runtimeKey, args, binding);
          originalOnBlur?.(...args);
        },
      };

      // PhoneNumberBase: non-standard signature — value goes through phoneNumberBase prop,
      // onChange is nested inside phoneNumberBaseInputEvents. Remove the standard onChange.
      if (propsAsAny.phoneNumberBase !== undefined) {
        const originalEvents = propsAsAny.phoneNumberBaseInputEvents ?? {};
        nextProps.phoneNumberBase = runtimeConfig.stateValue ?? propsAsAny.phoneNumberBase ?? '';
        nextProps.phoneNumberBaseInputEvents = {
          ...originalEvents,
          onChange: (...args: any[]) => {
          onValueChange(runtimeConfig, runtimeKey, args, binding);
          originalEvents.onChange?.(...args);
        },
      };
      delete nextProps.onChange;
        return nextProps;
      }

      // Checkbox: controlled via `checked` boolean
      if (runtimeConfig.fieldType === 'Checkbox') {
        nextProps.checked = !!(runtimeConfig.stateValue ?? propsAsAny.checked);
        return nextProps;
      }

      // All remaining field types: controlled via `value`
      if (runtimeConfig.stateValue !== undefined || propsAsAny.value !== undefined) {
        // ColorPicker uses a two-phase value: inputValue tracks the raw typed hex,
        // stateValue tracks the last committed valid hex. Use inputValue for display
        // unless it has diverged from the committed value (i.e. in-flight invalid input).
        const shouldUseInputValue =
          runtimeConfig.fieldType !== 'ColorPicker' ||
          runtimeConfig.getInputValue?.() === undefined ||
          runtimeConfig.getInputValue?.() === runtimeConfig.getValue?.();

        nextProps.value = shouldUseInputValue
          ? (runtimeConfig.getInputValue?.() ?? runtimeConfig.stateValue ?? propsAsAny.value ?? '')
          : (runtimeConfig.stateValue ?? propsAsAny.value ?? '');
      }

      return nextProps;
    };

    const mapChildren = (nodes: React.ReactNode): React.ReactNode =>
      React.Children.map(nodes, (child) => {
        if (!React.isValidElement(child)) {
          return child;
        }

        const propsAsAny = child.props as any;
        const componentName = getComponentName(child);

        // formConfigKey is used for legacy wrapper components that receive config via prop
        // rather than via context (e.g. a non-auto-bindable wrapper that needs to forward config)
        const formConfigKey = extractFormConfigKey(child);
        const isBindableComponent = !!componentName && AUTO_BINDABLE_COMPONENTS.has(componentName);

        // M1: Field identity resolution — prefer explicit `name` prop, fall back to
        // legacy `stateFieldName` from embedded config, then positional auto-index.
        const resolvedIdentity = resolveFieldName(
          propsAsAny,
          config,
          isBindableComponent ? autoConfigIndex : undefined,
        );

        // Auto-index advances only for legacy-fallback bindings so that name-bound
        // children do not disturb the positional mapping of legacy siblings.
        if (
          isBindableComponent &&
          !propsAsAny.name &&
          resolvedIdentity.usesLegacyFallback &&
          resolvedIdentity.baseConfig
        ) {
          autoConfigIndex += 1;
        }

        // fieldType is derived from the component name (primary) or explicit child props
        // (type="number", multiline) before falling back to any embedded config fieldType.
        const fieldType = resolveFieldType(componentName, propsAsAny, resolvedIdentity.baseConfig);
        const fieldName = resolvedIdentity.fieldName;
        const baseConfig = resolvedIdentity.baseConfig;

        // Guard: if this bindable child is already nested inside a bound field (e.g. an
        // InputBase inside a PhoneNumber wrapper that was already bound by the parent),
        // skip re-binding and only recurse into its children.
        const parentFieldConfig = propsAsAny.fieldConfig || null;
        const isNestedWithinBoundField = !!parentFieldConfig?.stateFieldName;

        if (isNestedWithinBoundField && AUTO_BINDABLE_COMPONENTS.has(componentName ?? '')) {
          if (!propsAsAny.children) {
            return child;
          }
          return React.cloneElement(child, {}, mapChildren(propsAsAny.children));
        }

        // Non-bindable or unresolved: recurse into children but do not inject control props
        if (!fieldName || !baseConfig || !fieldType) {
          if (!propsAsAny.children) {
            return child;
          }
          return React.cloneElement(child, {}, mapChildren(propsAsAny.children));
        }

        // Array field: each occurrence of the same fieldName gets its own array index
        let idx: number | undefined;
        if (baseConfig.isArray) {
          idxMap[fieldName] = idxMap[fieldName] !== undefined ? idxMap[fieldName] + 1 : 0;
          idx = idxMap[fieldName];
        }

        const binding = buildRuntimeBinding<T>({
          fieldName,
          idx,
          fieldType,
          configKey: formConfigKey,
          baseConfig,
          childProps: propsAsAny,
          componentName,
        });

        // Runtime config is the parent-owned, registry-managed field state object
        const runtimeConfig = getRuntimeConfig(binding);
        activeInputs[binding.runtimeKey] = runtimeConfig;

        // injectedConfig: expose the config to child context, stripping Redux setters
        // for non-control children to prevent accidental double-dispatch
        const injectedConfig = binding.preserveControl ? runtimeConfig : cloneWithoutFormControl(runtimeConfig);

        // Apply the injection matrix: parent decides value/checked/onChange for the child
        const nextProps = buildInjectedProps(runtimeConfig, binding.runtimeKey, propsAsAny, binding);

        // ColorPicker: value is intentionally not injected as a prop — the component
        // manages display state internally, driven by __runtimeValueRef on the config
        if (runtimeConfig.fieldType === 'ColorPicker') {
          delete nextProps.value;
        }

        // Legacy wrapper forwarding: for non-auto-bindable components that carry a config
        // prop key, re-inject the config so they can forward it to their inner children
        if (formConfigKey && !AUTO_BINDABLE_COMPONENTS.has(componentName ?? '')) {
          nextProps[formConfigKey] = injectedConfig;
        }

        if (propsAsAny.children) {
          nextProps.children = mapChildren(propsAsAny.children);
        }

        return (
          // FieldConfigProvider makes the runtime config available via useFieldConfigContext()
          // for children that need refs, validation info, or supplementary config access
          <FieldConfigProvider key={child.key ?? binding.runtimeKey} fieldConfig={injectedConfig}>
            {React.cloneElement(child, nextProps)}
          </FieldConfigProvider>
        );
      });

    return {
      activeInputs,
      children: mapChildren(children),
    };
  }, [children, config, getRuntimeConfig, onValueChange, onFieldBlur]);
};
