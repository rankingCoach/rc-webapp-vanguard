import { render, waitFor } from '@test-utils/test-utils';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { TableContextType, TableProvider } from '../Table';
import { FooterPagination } from './FooterPagination/FooterPagination';
import { FooterShowLess } from './FooterShowLess/FooterShowLess';
import { FooterShowMore } from './FooterShowMore/FooterShowMore';

/**
 * Audit item 3: the footer controls share one renderer. The markup of every control across the pagination matrix was
 * captured from the pre-refactor code (8f3b328) into __fixtures__/footer-controls.json and must stay byte-identical.
 * Regenerate only on purpose: FOOTER_FIXTURE_WRITE=1.
 */
const fixturePath = join(__dirname, '__fixtures__', 'footer-controls.json');
const noop = () => {};

const paginations = {
  first: { total: 30, limit: 10, offset: 0, minPage: 1, maxPage: 3 },
  middle: { total: 30, limit: 10, offset: 10, minPage: 1, maxPage: 3 },
  last: { total: 30, limit: 10, offset: 20, minPage: 1, maxPage: 3 },
  single: { total: 5, limit: 10, offset: 0, minPage: 1, maxPage: 1 },
  none: undefined,
} as const;

const controls = {
  pagination: (hidden: boolean) => <FooterPagination isHidden={hidden} />,
  showMore: (hidden: boolean) => <FooterShowMore isHidden={hidden} />,
  showLess: (hidden: boolean) => <FooterShowLess isHidden={hidden} />,
};

const cases = Object.entries(paginations).flatMap(([p, pagination]) =>
  Object.entries(controls).flatMap(([c, el]) => [false, true].map((hidden) => ({ key: `${c}/${p}/hidden=${hidden}`, pagination, el: el(hidden) }))),
);

const renderCase = async ({ pagination, el }: (typeof cases)[number]) => {
  const ctx = {
    data: { columns: [], rows: [] },
    pagination,
    onNextPage: noop,
    onPrevPage: noop,
    onShowMore: noop,
    onShowLess: noop,
  } as unknown as TableContextType;
  const { container, unmount } = render(<TableProvider.Provider value={ctx}>{el}</TableProvider.Provider>);
  const ctas = container.querySelectorAll('[data-slot="cta-with-icon"]').length;
  await waitFor(() => expect(container.querySelectorAll('[data-slot="icon"]').length).toBe(ctas));
  const html = container.innerHTML;
  unmount();
  return html;
};

describe('Table footer controls: markup is unchanged by the shared renderer', () => {
  it('matches the pre-refactor fixture for every control x pagination x hidden', async () => {
    const actual: Record<string, string> = {};
    for (const c of cases) actual[c.key] = await renderCase(c);
    if (process.env.FOOTER_FIXTURE_WRITE === '1' || !existsSync(fixturePath)) {
      writeFileSync(fixturePath, `${JSON.stringify(actual, null, 2)}\n`);
    }
    const expected = JSON.parse(readFileSync(fixturePath, 'utf8')) as Record<string, string>;
    expect(Object.keys(actual)).toEqual(Object.keys(expected));
    for (const k of Object.keys(expected)) expect(actual[k], k).toBe(expected[k]);
  }, 60_000);
});
