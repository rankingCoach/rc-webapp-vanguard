import { TextReplacements } from '@vanguard/Text/Text';

import { ListPageFilter, ListPageFilterType } from './ListPageFilter';

export type ListPageCheckboxFilterOption<T> = {
  name: string;
  labelText: string;
  summaryKey?: string;
  value?: T;
  checked?: boolean | ((filters: any) => boolean);
  replacements?: TextReplacements;
  elementsCount?: number;
  translationContext?: 'one' | 'other';
  // New property to override serialization at the option level
  serializeToQuery?: boolean | ((filters: any) => boolean);
  // New property to individually disable options
  disabled?: boolean | ((filters: any) => boolean);
  hidden?: boolean | ((filters: any) => boolean);
};

export class ListPageCheckboxFilter<T> implements ListPageFilter {
  // Common properties
  name: string;
  queryParam: string;
  disabled?: boolean | ((filters: any) => boolean);
  serialize?: (filters: any) => any;
  hidden?: boolean;
  automaticRequest?: boolean;
  serializeToQuery?: boolean | ((filters: any) => boolean) = true;

  // Checkbox filter specific properties
  options: ListPageCheckboxFilterOption<T>[];
  /**
   * Selecting querySerializationType modifies how a selection is transformed from query param to filter.
   *
   * Example Usage:
   *
   * const filters = new ListPageCheckboxFilter<string>({
   *   name: "Content type",
   *   queryParam: "type",
   *   type: ListPageFilterType.Checkbox,
   *   querySerializationType: "DEPENDS",
   *   options: [
   *     { name: PostType.POST, labelText: "Posts" },
   *     { name: PostType.EVENT, labelText: "Events" },
   *   ],
   * });
   *
   * Query Serialization Types:
   *
   * 1. Type Array
   *     Used to define a simple array conditioning data from the SAME column, spreads the data into multiple or statements of oData query
   *    const converted = convertStateFiltersToQueryParams([filters], {
   *      filters: { type: { [PostType.POST]: true, [PostType.EVENT]: true } },
   *    });
   *    expect(converted).toBe(`type in ['POST', 'EVENT']`);
   *
   * 2. Type Individual
   *  Used to define a simple array conditioning data from the SAME column , uses the 'In' syntax of oData
   *    const converted = convertStateFiltersToQueryParams([filters], {
   *      filters: { type: { [PostType.POST]: true, [PostType.EVENT]: true } },
   *    });
   *    expect(converted).toBe(`type eq 'POST' or type eq 'EVENT'`);
   *
   *
   * 3. Type Boolean
   *     Used to define an or statements between multiple columns column1 or column2 or column3 in odata
   *    const converted = convertStateFiltersToQueryParams([filters], {
   *      filters: { type: { [PostType.POST]: true, [PostType.EVENT]: true } },
   *    });
   *    expect(converted).toBe(( POST eq 'true' or EVENT eq 'true'`));
   * Supported Query Serialization Types:
   * - "array"     : Transforms filter to use `in` syntax (e.g., `type in ['POST', 'EVENT']`).
   * - "individual": Transforms filter to use `or` syntax (e.g., `type eq 'POST' or type eq 'EVENT'`).
   * - "boolean"   : Transforms filter to a boolean representation.  (e.g., POST eq 'true' or EVENT eq 'true'`).
   */
  querySerializationType: 'array' | 'individual' | 'boolean' = 'array';

  // Filter type
  type = ListPageFilterType.Checkbox;

  constructor(init?: Partial<ListPageCheckboxFilter<T>>) {
    Object.assign(this, init);
  }
}
