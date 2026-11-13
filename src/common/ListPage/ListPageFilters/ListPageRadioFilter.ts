import { TextReplacements } from '@vanguard/Text/Text';

import { ListPageFilter, ListPageFilterType } from './ListPageFilter';

export interface ListPageRadioFilterOption<ValueType = string> {
  name: string;
  value: ValueType;
  labelText: string;
  elementsCount?: number;
  disabled?: boolean;
  replacements?: TextReplacements;
  translationContext?: 'one' | 'other';
  infoText?: string | React.ReactNode;
  children?: React.ReactNode;
}

export class ListPageRadioFilter<ValueType = string> implements ListPageFilter {
  // Common properties
  name: string;
  queryParam: string;
  disabled?: boolean | ((filters: any) => boolean);
  hidden?: boolean;
  serializeToQuery?: boolean | ((filters: any) => boolean) = true;

  // Radio filter specific properties
  options: Array<ListPageRadioFilterOption<ValueType>>;
  defaultValue?: ValueType;
  initialSelection?: ValueType;
  automaticRequest?: boolean;
  /**
   * Selecting querySerializationType modifies how a selection is transformed from query param to filter.
   *
   * Supported Query Serialization Types:
   * - "value"    : Transforms filter to use single value (e.g., `type eq 'POST'`).
   * - "boolean"  : Transforms filter to use boolean value for the selected option.
   */
  querySerializationType: 'value' | 'boolean' = 'value';

  // Filter type
  type = ListPageFilterType.Radio;

  constructor(init?: Partial<ListPageRadioFilter<ValueType>>) {
    Object.assign(this, init);
  }
}
