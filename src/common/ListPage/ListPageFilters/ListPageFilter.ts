export enum ListPageFilterType {
  Radio = 'radio',
  Switch = 'switch',
  Checkbox = 'checkbox',
  Range = 'range',
  DateRange = 'dateRange',
  Selector = 'selector',
}

export interface ListPageFilter {
  name: string;
  type: ListPageFilterType;
  queryParam: string;
  hidden?: boolean;
  automaticRequest?: boolean;
  // TODO ADD TYPINGS
  disabled?: boolean | ((filters: any) => boolean);
  serializeToQuery?: boolean | ((filters: any) => boolean);
}
