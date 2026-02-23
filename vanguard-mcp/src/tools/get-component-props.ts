import { z } from 'zod';

import { normalizeComponentId, PropsLoader } from '../loaders/props-loader.js';
import { ComponentParser } from '../parsers/component-parser.js';
import { ComponentIndex, ComponentPropsDetails } from '../types.js';

const GetComponentPropsInputSchema = z.object({
  componentName: z.string().describe('Name of the component'),
});

type GetComponentPropsInput = z.infer<typeof GetComponentPropsInputSchema>;

/**
 * Return parsed props (fields, types, optional flag, descriptions) for a component
 * Includes dependent types (enums, type aliases, etc.) used by the props
 */
export function getComponentProps(
  componentIndex: ComponentIndex,
  input: GetComponentPropsInput,
): ComponentPropsDetails | null {
  const component = componentIndex[input.componentName];
  if (!component) {
    return null;
  }

  // Try to load from pre-generated JSON first
  const componentId = normalizeComponentId(input.componentName);
  const propsData = PropsLoader.loadComponentProps(componentId);

  if (propsData) {
    return {
      componentName: propsData.componentName,
      fields: propsData.props,
      raw: propsData.propsRaw,
      dependentTypes: propsData.dependentTypes,
    };
  }

  // Fallback to dynamic parsing if JSON not found
  if (!component.componentFilePath) {
    return null;
  }

  return ComponentParser.getComponentPropsDetails(component.componentFilePath, input.componentName);
}

export { GetComponentPropsInputSchema };
