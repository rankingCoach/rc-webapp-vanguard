import { convertStateFiltersToQueryParams } from '@custom-hooks/use-bind-query-param-to-redux-state';
import { ListPageCheckboxFilter } from '@common/ListPage/ListPageFilters/ListPageCheckboxFilter';
import { ListPageFilterType } from '@common/ListPage/ListPageFilters/ListPageFilter';
import { describe, expect, it } from 'vitest';

const PostType = { POST: 'POST', EVENT: 'EVENT' } as const;

describe('Serialization tests of list page checkbox filters', () => {
  it("querySerializationType array should result in 'element in [type1,type2]'", () => {
    const filters = new ListPageCheckboxFilter<string>({
      name: 'Content type',
      queryParam: 'type',
      type: ListPageFilterType.Checkbox,
      querySerializationType: 'array',
      options: [
        { name: PostType.POST, labelText: 'Posts' },
        { name: PostType.EVENT, labelText: 'Events' },
      ],
    });

    const converted = convertStateFiltersToQueryParams([filters], {
      filters: { type: { [PostType.POST]: true, [PostType.EVENT]: true } },
    });
    expect(converted).toBe("type in ['POST', 'EVENT']");
  });

  it("querySerializationType individual should result in 'type eq type1 or type eq type2", () => {
    const filters = new ListPageCheckboxFilter<string>({
      name: 'Content type',
      queryParam: 'type',
      type: ListPageFilterType.Checkbox,
      querySerializationType: 'individual',
      options: [
        { name: PostType.POST, labelText: 'Posts' },
        { name: PostType.EVENT, labelText: 'Events' },
      ],
    });

    const converted = convertStateFiltersToQueryParams([filters], {
      filters: { type: { [PostType.POST]: true, [PostType.EVENT]: true } },
    });
    expect(converted).toBe("(type eq 'POST' or type eq 'EVENT')");
  });

  it("querySerializationType individual should result in 'type eq type1 or type eq type2", () => {
    const filters = new ListPageCheckboxFilter<string>({
      name: 'Content type',
      queryParam: 'type',
      type: ListPageFilterType.Checkbox,
      querySerializationType: 'boolean',
      options: [
        { name: PostType.POST, labelText: 'Posts' },
        { name: PostType.EVENT, labelText: 'Events' },
      ],
    });

    const converted = convertStateFiltersToQueryParams([filters], {
      filters: { type: { [PostType.POST]: true, [PostType.EVENT]: true } },
    });
    expect(converted).toBe("(POST eq '1' or EVENT eq '1')");
  });
});
