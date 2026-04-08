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
};

export const useBuiltFormChildren = <T,>({
  children,
  config,
  getRuntimeConfig,
  onValueChange,
}: UseBuiltFormChildrenParams<T>) => {
  return useMemo(() => {
    const idxMap: Record<string, number> = {};
    const activeInputs: Record<string, FormConfigElement<T>> = {};
    let autoConfigIndex = 0;

    const buildInjectedProps = (
      runtimeConfig: FormConfigElement<T>,
      runtimeKey: string,
      propsAsAny: Record<string, any>,
      binding: RuntimeFieldBinding<T>,
    ) => {
      const originalOnChange = propsAsAny.onChange;
      const nextProps: Record<string, any> = {
        name: binding.fieldName,
        onChange: (...args: any[]) => {
          onValueChange(runtimeConfig, runtimeKey, args, binding);
          originalOnChange?.(...args);
        },
      };
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
      }
      if (runtimeConfig.fieldType === 'Checkbox') {
        nextProps.checked = !!(runtimeConfig.stateValue ?? propsAsAny.checked);
      } else if (
        propsAsAny.phoneNumberBase === undefined &&
        (runtimeConfig.stateValue !== undefined || propsAsAny.value !== undefined)
      ) {
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
        const formConfigKey = extractFormConfigKey(child);
        const isBindableComponent = !!componentName && AUTO_BINDABLE_COMPONENTS.has(componentName);
        const resolvedIdentity = resolveFieldName(
          propsAsAny,
          config,
          isBindableComponent ? autoConfigIndex : undefined,
        );

        if (
          isBindableComponent &&
          !propsAsAny.name &&
          resolvedIdentity.usesLegacyFallback &&
          resolvedIdentity.baseConfig
        ) {
          autoConfigIndex += 1;
        }

        const fieldType = resolveFieldType(componentName, propsAsAny, resolvedIdentity.baseConfig);
        const fieldName = resolvedIdentity.fieldName;
        const baseConfig = resolvedIdentity.baseConfig;
        const parentFieldConfig = propsAsAny.fieldConfig || null;
        const isNestedWithinBoundField = !!parentFieldConfig?.stateFieldName;

        if (isNestedWithinBoundField && AUTO_BINDABLE_COMPONENTS.has(componentName ?? '')) {
          if (!propsAsAny.children) {
            return child;
          }

          return React.cloneElement(child, {}, mapChildren(propsAsAny.children));
        }

        if (!fieldName || !baseConfig || !fieldType) {
          if (!propsAsAny.children) {
            return child;
          }

          return React.cloneElement(child, {}, mapChildren(propsAsAny.children));
        }

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
        const runtimeConfig = getRuntimeConfig(binding);
        activeInputs[binding.runtimeKey] = runtimeConfig;

        const injectedConfig = binding.preserveControl ? runtimeConfig : cloneWithoutFormControl(runtimeConfig);
        const nextProps = buildInjectedProps(runtimeConfig, binding.runtimeKey, propsAsAny, binding);

        if (runtimeConfig.fieldType === 'ColorPicker') {
          delete nextProps.value;
        }

        if (formConfigKey && !AUTO_BINDABLE_COMPONENTS.has(componentName ?? '')) {
          nextProps[formConfigKey] = injectedConfig;
        }

        if (propsAsAny.children) {
          nextProps.children = mapChildren(propsAsAny.children);
        }

        return (
          <FieldConfigProvider key={child.key ?? binding.runtimeKey} fieldConfig={injectedConfig}>
            {React.cloneElement(child, nextProps)}
          </FieldConfigProvider>
        );
      });

    return {
      activeInputs,
      children: mapChildren(children),
    };
  }, [children, config, getRuntimeConfig, onValueChange]);
};
