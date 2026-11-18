import { TextField as MuiTextField } from '@mui/material';
import { render } from '@testing-library/react';
import postcss from 'postcss';
import React from 'react';
import { compile } from 'sass';
import { describe, expect, it } from 'vitest';

/**
 * Watchdog MAJOR (B's review): the compat CSS must apply only to elements the own core renders. The own core marks
 * them with `data-vg-core`; a `data-slot` alone (implementer B adds slots library-wide, consumers may pass their own)
 * must not opt an MUI-rendered element into own-core rules. The compat rules copy MUI's values, so computed styles
 * cannot show the leak; this checks the selectors themselves.
 */
const css = compile(`${process.cwd()}/src/styles/mui-compat.scss`).css;
const selectors: string[] = [];
postcss.parse(css).walkRules((rule) => {
  for (const sel of rule.selectors) if (/data-slot|data-vg-core/.test(sel)) selectors.push(sel);
});

describe('own-core compat CSS marker', () => {
  it('no compat selector uses a data-slot attribute as the own-core marker', () => {
    expect(
      selectors.filter((s) => /\[data-slot\]|\[data-slot=|\[data-slot\^=/.test(s) && !s.includes('data-vg-core')),
    ).toEqual([]);
  });

  it('MUI-rendered elements that carry a data-slot match none of the own-core selectors', () => {
    const slot = (name: string) => ({ 'data-slot': name });
    const view = render(
      <MuiTextField
        label="Name"
        required
        helperText="help"
        {...slot('text-field')}
        slotProps={{
          input: slot('text-field-input'),
          htmlInput: slot('text-field-control'),
          inputLabel: slot('text-field-label'),
          formHelperText: slot('text-field-helper'),
        }}
      />,
    );
    const hits: string[] = [];
    for (const el of view.container.querySelectorAll('*')) {
      for (const sel of selectors) {
        // jsdom's engine treats :where(...) as always matching; for matching, :where(X) is the same as X.
        const base = sel.replace(/:where\(([^()]*)\)/g, '$1').replace(/::?[a-z-]+(\([^)]*\))?$/i, '');
        try {
          if (el.matches(base)) hits.push(`${el.tagName}.${el.className} ~ ${sel}`);
        } catch {
          // selectors jsdom cannot evaluate (e.g. :has) are covered by the first check
        }
      }
    }
    view.unmount();
    expect(hits).toEqual([]);
  });
});
