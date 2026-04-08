import { FormConfigElement } from '@custom-hooks/useFormConfig';
import React, { useMemo } from 'react';

import { FieldConfigProvider } from '../FormConfigContext';
import { ConfigWithInternal } from './form.types';
import {
  AUTO_BINDABLE_COMPONENTS,
  cloneWithoutFormControl,
  extractFormConfig,
  extractFormConfigKey,
  getComponentName,
  getConfigEntries,
} from './form.utils';

type UseBuiltFormChildrenParams<T> = {
  children: React.ReactNode;
  config?: ConfigWithInternal<T>;
  getRuntimeConfig: (baseConfig: FormConfigElement<T>, idx?: number) => FormConfigElement<T>;
  onValueChange: (runtimeConfig: FormConfigElement<T>, runtimeKey: string, args: any[]) => void;
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
    const configEntries = getConfigEntries(config);
    let autoConfigIndex = 0;

    const mapChildren = (nodes: React.ReactNode): React.ReactNode =>
      React.Children.map(nodes, (child) => {
        if (!React.isValidElement(child)) {
          return child;
        }

        let childConfig = extractFormConfig(child);
        const formConfigKey = extractFormConfigKey(child);
        const propsAsAny = child.props as any;
        const componentName = getComponentName(child);

        if (!childConfig && componentName && AUTO_BINDABLE_COMPONENTS.has(componentName)) {
          const nextEntry = configEntries[autoConfigIndex];
          if (nextEntry) {
            autoConfigIndex += 1;
            childConfig = nextEntry[1] as FormConfigElement<T>;
          }
        }

        if (!childConfig?.stateFieldName) {
          if (!propsAsAny.children) {
            return child;
          }

          return React.cloneElement(child, {}, mapChildren(propsAsAny.children));
        }

        let idx: number | undefined;
        if (childConfig.isArray) {
          const key = childConfig.stateFieldName;
          idxMap[key] = idxMap[key] !== undefined ? idxMap[key] + 1 : 0;
          idx = idxMap[key];
        }

        const runtimeConfig = getRuntimeConfig(childConfig, idx);
        const runtimeKey = `${runtimeConfig.stateFieldName}${runtimeConfig.arrayPosition ?? ''}`;
        activeInputs[runtimeKey] = runtimeConfig;

        const shouldPreserveControl = propsAsAny.phoneNumberBase !== undefined;
        const injectedConfig = shouldPreserveControl ? runtimeConfig : cloneWithoutFormControl(runtimeConfig);
        const originalOnChange = propsAsAny.onChange;
        const nextProps: Record<string, any> = {
          onChange: (...args: any[]) => {
            onValueChange(runtimeConfig, runtimeKey, args);
            originalOnChange?.(...args);
          },
        };

        if (propsAsAny.phoneNumberBase !== undefined) {
          const originalEvents = propsAsAny.phoneNumberBaseInputEvents ?? {};
          nextProps.phoneNumberBase = runtimeConfig.stateValue ?? propsAsAny.phoneNumberBase ?? '';
          nextProps.phoneNumberBaseInputEvents = {
            ...originalEvents,
            onChange: (...args: any[]) => {
              onValueChange(runtimeConfig, runtimeKey, args);
              originalEvents.onChange?.(...args);
            },
          };
          delete nextProps.onChange;
        }

        if (formConfigKey && !AUTO_BINDABLE_COMPONENTS.has(componentName ?? '')) {
          nextProps[formConfigKey] = injectedConfig;
        }

        if (runtimeConfig.fieldType === 'Checkbox') {
          nextProps.checked = !!(runtimeConfig.stateValue ?? propsAsAny.checked);
        } else if (
          runtimeConfig.fieldType !== 'ColorPicker' &&
          propsAsAny.phoneNumberBase === undefined &&
          (runtimeConfig.stateValue !== undefined || propsAsAny.value !== undefined)
        ) {
          nextProps.value = runtimeConfig.stateValue ?? propsAsAny.value ?? '';
        }

        if (propsAsAny.children) {
          nextProps.children = mapChildren(propsAsAny.children);
        }

        return (
          <FieldConfigProvider key={child.key ?? runtimeKey} fieldConfig={injectedConfig}>
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
