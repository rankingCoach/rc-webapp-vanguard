import { act, render } from '@test-utils/test-utils';
import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion } from '@vanguard/Accordion/Accordion';
import { AppBar } from '@vanguard/AppBar/AppBar';
import { Autocomplete } from '@vanguard/Autocomplete/Autocomplete';
import { Chip } from '@vanguard/Chip/Chip';
import { Drawer } from '@vanguard/Drawer/Drawer';
import { SearchableSelect } from '@vanguard/SearchableSelect/SearchableSelect';
import { Select } from '@vanguard/Select/Select';
import { Snackbar } from '@vanguard/Snackbar/Snackbar';
import { ToggleButton } from '@vanguard/ToggleButton/ToggleButton';
import { ToggleButtonGroup } from '@vanguard/ToggleButtonGroup/ToggleButtonGroup';
import { Toolbar } from '@vanguard/Toolbar/Toolbar';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * Handoff gate (watchdog, after the d51c135 ButtonBase finding): no junk in any class attribute of the own-core
 * components in their open/selected states — no leading/trailing/double space and no false/undefined/null/NaN/
 * [object token. Scans the whole document (portaled popups included), svg class attributes too.
 */
const JUNK = /^\s|\s$|\s{2}|(^|\s)(false|true|undefined|null|NaN)(\s|$)|\[object/;

// Own-core markup only (data-vg-core): Vanguard-skin classes built with @helpers/classNames carry the same junk on
// the 9d3b75b baseline and belong to B's junk-token track (h).
const scan = () =>
  Array.from(document.querySelectorAll('[data-vg-core][class], [data-vg-core] svg[class]'))
    .map((el) => el.getAttribute('class') ?? '')
    .filter((cls) => JUNK.test(cls));

const settle = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 400));
  });

const OPTIONS = [
  { key: 0, value: 'a', title: 'Alpha' },
  { key: 1, value: 'b', title: 'Beta' },
];

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('own-core class attributes carry no junk tokens', () => {
  it('Select open (MenuItem list), selected + disabled items', async () => {
    const view = render(
      <Select options={[...OPTIONS, { key: 2, value: 'c', title: 'Gamma', disabled: true } as never]} value="a" />,
    );
    await userEvent.click(view.getByRole('combobox'));
    await settle();
    expect(scan()).toEqual([]);
  });

  it('SearchableSelect open', async () => {
    const view = render(<SearchableSelect<string> options={OPTIONS} value="b" />);
    await userEvent.click(view.getByRole('combobox'));
    await settle();
    expect(scan()).toEqual([]);
  });

  it('Autocomplete multiple with chips, open', async () => {
    const view = render(<Autocomplete options={OPTIONS} optionKey="title" multiple value={[OPTIONS[0]] as never} />);
    await userEvent.click(view.container.querySelector('input') as HTMLElement);
    await settle();
    expect(scan()).toEqual([]);
  });

  it('ToggleButtonGroup with a selected and a disabled button', async () => {
    render(
      <ToggleButtonGroup value="left" exclusive>
        <ToggleButton value="left">{'Left'}</ToggleButton>
        <ToggleButton value="right" disabled>
          {'Right'}
        </ToggleButton>
      </ToggleButtonGroup>,
    );
    await settle();
    expect(scan()).toEqual([]);
  });

  it('Chip small/deletable (ButtonBase)', async () => {
    render(<Chip label="Tag" size={'small' as never} onDelete={() => undefined} />);
    await settle();
    expect(scan()).toEqual([]);
  });

  // Fixed in track (h): Accordion root and the own Collapse build their classes with `cx`.
  it('Accordion expanded (B: Accordion root, own Collapse)', async () => {
    render(
      <Accordion
        accordionId="scan"
        summaryChildren={<span>{'Summary'}</span>}
        detailsChildren={<p>{'Details'}</p>}
        expanded
      />,
    );
    await settle();
    expect(scan()).toEqual([]);
  });

  it('Drawer temporary open, Snackbar open with action', async () => {
    render(
      <>
        <Drawer open variant="temporary" title="Scan" showCloseButton>
          {'x'}
        </Drawer>
        <Snackbar open message="Saved" action={<button type="button">{'Undo'}</button>} />
      </>,
    );
    await settle();
    expect(scan()).toEqual([]);
  });

  it('AppBar / Toolbar (rc-webapp Navbar shape)', async () => {
    render(
      <AppBar className="appBar  scrolled " position="fixed">
        <Toolbar className="toolbar">{'Nav'}</Toolbar>
      </AppBar>,
    );
    await settle();
    expect(scan()).toEqual([]);
  });
});
