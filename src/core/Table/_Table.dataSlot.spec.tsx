import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Table, TableProvider, TableContextType } from './Table';
import { TableHeader } from './TableHeader/TableHeader';
import { TableBody } from './TableBody/TableBody';
import { TableFooter } from './TableFooter/TableFooter';
import { TableToolbar } from './TableToolbar/TableToolbar';
import { TableCell, TableCellContent } from './TableCell/TableCell';
import { FooterShowLess } from './TableFooter/FooterShowLess/FooterShowLess';
import { FooterShowMore } from './TableFooter/FooterShowMore/FooterShowMore';
import { FooterPagination } from './TableFooter/FooterPagination/FooterPagination';
import { TablePlaceholder, TableRowPlaceholder } from './common/TablePlaceholder/TablePlaceholder';
import { CtaWithIcon } from './common/CtaWithIcon/CtaWithIcon';

const columns = [{ alias: 'name', text: 'Name', sortable: true }];
const context: TableContextType = {
  data: { columns, collections: [{ name: 'One' }, { name: 'Hidden', isBlurred: true }], blurredMessage: 'Locked' },
  pagination: { total: 10, limit: 5, offset: 0, page: 1, minPage: 1, maxPage: 2, step: 1 },
  onSortToggle: () => {},
};

const parts = () => (
  <TableProvider.Provider value={context}>
    <table>
      <TableHeader className={'mine'} />
      <TableBody />
      <TableFooter />
    </table>
  </TableProvider.Provider>
);

describe('Table data-slot contract', () => {
  it('slots the container and the table receiving the consumer className', () => {
    const { container, rerender } = render(<Table className={'mine'} containerClassName={'wrapper'} />);
    expect(container.querySelector('[data-slot="table-container"]')?.classList.contains('wrapper')).toBe(true);
    const root = container.querySelector('[data-slot="table"]')!;
    expect(root.tagName).toBe('TABLE');
    expect(root.classList.contains('mine')).toBe(true);
    rerender(<Table isLoading />);
    expect(container.querySelector('[data-slot="table-placeholder"]')?.tagName).toBe('DIV');
  });

  it('slots header, body, rows, cells, sort control and footer on their existing elements', () => {
    const { container } = render(parts());
    const tags: Record<string, string> = {
      'table-header': 'THEAD', 'table-row': 'TR', 'table-cell': 'TD',
      'table-header-cell': 'TH', 'table-sort-button': 'BUTTON',
      'table-body': 'TBODY', 'table-body-blurred': 'TBODY',
      'table-blurred-message-row': 'TR', 'table-blurred-message-cell': 'TD', 'table-blurred-message': 'DIV',
      'table-footer': 'TFOOT', 'table-footer-row': 'TR', 'table-footer-cell': 'TD',
      'table-footer-controls': 'DIV', 'table-footer-more-controls': 'DIV', 'table-footer-pagination': 'DIV',
      'table-cell-inner': 'DIV',
    };
    for (const [slot, tag] of Object.entries(tags)) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe(tag);
    }
    expect(container.querySelector('[data-slot="table-header"]')?.classList.contains('mine')).toBe(true);
  });

  it('slots prefix and postfix content and tracks their type', () => {
    const cell = (type: 'prefix' | 'postfix') => (
      <table><tbody><tr><td><TableCellContent row={{ id: 1 }} column={columns[0]} type={type} options={{
        prefixForColumn: [{ columnAlias: 'name', value: () => 'Before', valueParam: 'id' }],
        postfixForColumn: [{ columnAlias: 'name', value: () => 'After', valueParam: 'id' }],
      }} /></td></tr></tbody></table>
    );
    const { container, rerender } = render(
      <table><tbody><tr><TableCell row={{ name: 'One', id: 1 }} column={columns[0]} options={{
        prefixForColumn: [{ columnAlias: 'name', value: () => 'Before', valueParam: 'id' }],
        postfixForColumn: [{ columnAlias: 'name', value: () => 'After', valueParam: 'id' }],
      }} /></tr></tbody></table>,
    );
    for (const type of ['prefix', 'postfix']) {
      const part = container.querySelector(`[data-slot="table-cell-content"][data-type="${type}"]`)!;
      expect(part.tagName).toBe('DIV');
      expect(part.classList.contains(`optional-${type}`)).toBe(true);
    }
    rerender(cell('prefix'));
    expect(container.querySelector('[data-slot="table-cell-content"]')?.getAttribute('data-type')).toBe('prefix');
    rerender(cell('postfix'));
    expect(container.querySelector('[data-slot="table-cell-content"]')?.getAttribute('data-type')).toBe('postfix');
  });

  it('slots the toolbar and its title and controls', () => {
    const { container } = render(<TableToolbar testId={'table'} options={{ title: 'Title' }} searchText={''} columns={columns} hiddenColumns={[]} onSearchTextChange={() => {}} onToggleColumn={() => {}} onDownload={() => {}} />);
    for (const slot of ['table-toolbar', 'table-toolbar-title', 'table-toolbar-controls']) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe('DIV');
    }
  });

  it('slots show controls, placeholders and their layouts', () => {
    const { container } = render(<><FooterShowLess /><FooterShowMore /><TablePlaceholder /><TableRowPlaceholder /></>);
    for (const slot of ['footer-show-less-container', 'footer-show-more-container', 'table-placeholder', 'table-placeholder-content', 'table-row-placeholder', 'table-row-placeholder-content']) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe('DIV');
    }
  });

  it('tracks disabled on the styled CTA and pagination controls', () => {
    const { container, rerender } = render(<CtaWithIcon className={'mine'}>Go</CtaWithIcon>);
    const root = () => container.querySelector('[data-slot="cta-with-icon"]')!;
    expect(root().tagName).toBe('DIV');
    expect(root().classList.contains('mine')).toBe(true);
    expect(root().hasAttribute('data-disabled')).toBe(false);
    rerender(<CtaWithIcon disabled>Go</CtaWithIcon>);
    expect(root().getAttribute('data-disabled')).toBe('');
    rerender(<TableProvider.Provider value={context}><FooterPagination /></TableProvider.Provider>);
    let controls = container.querySelectorAll('[data-slot="cta-with-icon"]');
    expect(controls[0].getAttribute('data-disabled')).toBe('');
    expect(controls[1].hasAttribute('data-disabled')).toBe(false);
    rerender(<TableProvider.Provider value={{ ...context, pagination: { ...context.pagination!, offset: 5, page: 2 } }}><FooterPagination /></TableProvider.Provider>);
    controls = container.querySelectorAll('[data-slot="cta-with-icon"]');
    expect(controls[0].hasAttribute('data-disabled')).toBe(false);
    expect(controls[1].getAttribute('data-disabled')).toBe('');
  });
});
