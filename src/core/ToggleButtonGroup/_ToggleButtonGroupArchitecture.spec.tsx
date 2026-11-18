import { ToggleButton } from '@vanguard/ToggleButton/ToggleButton';
import { ToggleButtonGroup } from '@vanguard/ToggleButtonGroup/ToggleButtonGroup';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '../../../test-utils/test-utils';

/**
 * Own-core architecture contract (UI SDK style): stable data-slot / state attributes that agents, tests and styles
 * address, and legacy Mui* class names kept for consumer CSS during the migration.
 */
describe('ToggleButtonGroup own-core contract', () => {
  it('group exposes data-slot and data-orientation', () => {
    render(
      <ToggleButtonGroup value="a" orientation="vertical" aria-label="g">
        <ToggleButton value="a">{'A'}</ToggleButton>
        <ToggleButton value="b">{'B'}</ToggleButton>
      </ToggleButtonGroup>,
    );
    const group = screen.getByRole('group');
    expect(group.getAttribute('data-slot')).toBe('toggle-button-group');
    expect(group.getAttribute('data-orientation')).toBe('vertical');
  });

  it('buttons expose data-slot, data-pressed, data-disabled and data-value', () => {
    render(
      <ToggleButtonGroup value="a">
        <ToggleButton value="a">{'A'}</ToggleButton>
        <ToggleButton value="b" disabled>
          {'B'}
        </ToggleButton>
      </ToggleButtonGroup>,
    );
    const a = screen.getByRole('button', { name: 'A' });
    const b = screen.getByRole('button', { name: 'B' });
    expect(a.getAttribute('data-slot')).toBe('toggle-button');
    expect(a.hasAttribute('data-pressed')).toBe(true);
    expect(b.hasAttribute('data-pressed')).toBe(false);
    expect(b.hasAttribute('data-disabled')).toBe(true);
    expect(a.getAttribute('data-value')).toBe('a');
  });

  it('keeps the legacy Mui* class names consumers may style', () => {
    render(
      <ToggleButtonGroup value="a">
        <ToggleButton value="a">{'A'}</ToggleButton>
        <ToggleButton value="b">{'B'}</ToggleButton>
      </ToggleButtonGroup>,
    );
    const group = screen.getByRole('group');
    expect(group.classList.contains('MuiToggleButtonGroup-root')).toBe(true);
    const a = screen.getByRole('button', { name: 'A' });
    for (const c of [
      'MuiButtonBase-root',
      'MuiToggleButton-root',
      'MuiToggleButtonGroup-grouped',
      'MuiToggleButtonGroup-firstButton',
      'Mui-selected',
    ]) {
      expect(a.classList.contains(c)).toBe(true);
    }
  });

  it('does not import @mui', async () => {
    const sources = import.meta.glob(['../ToggleButton/ToggleButton.tsx', './ToggleButtonGroup.tsx'], {
      query: '?raw',
      import: 'default',
      eager: true,
    }) as Record<string, string>;
    expect(Object.keys(sources)).toHaveLength(2);
    for (const src of Object.values(sources)) {
      expect(src).not.toMatch(/@mui\//);
    }
  });
});
