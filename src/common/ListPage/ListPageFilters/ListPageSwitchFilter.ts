import { TextReplacements } from '@vanguard/Text/Text';

import { ListPageFilter, ListPageFilterType } from './ListPageFilter';

export type ListPageSwitchFilterOption = {
  name: string;
  labelText: string;
  summaryKey?: string;
  value?: boolean | string;
  checked?: boolean;
  replacements?: TextReplacements;
  elementsCount?: number;
  translationContext?: 'one' | 'other';
};

export class ListPageSwitchFilter implements ListPageFilter {
  // Common properties
  name: string;
  hidden: boolean;
  disabled?: boolean | ((filters: any) => boolean);
  queryParam: string;
  type = ListPageFilterType.Switch;
  querySerializationType?: 'boolean' | 'value' = 'boolean';
  options: ListPageSwitchFilterOption[];
  automaticRequest?: boolean;
  serializeToQuery?: boolean | ((filters: any) => boolean);
  serialize?: (filters: any) => any;

  constructor(init?: Partial<ListPageSwitchFilter>) {
    Object.assign(this, init);
    this.type = ListPageFilterType.Switch;
  }
}
