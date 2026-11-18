import { ToggleButton as MuiToggleButton, ToggleButtonGroup as MuiToggleButtonGroup } from '@mui/material';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { ToggleButton } from '@vanguard/ToggleButton/ToggleButton';
import React from 'react';
import { expect, within } from 'storybook/test';
import { ToggleButtonGroup } from './ToggleButtonGroup';

/**
 * Differential parity (verifier Tier B, rc-webapp LogsPage): the same consumer override as LogsPage.module.scss
 * (`.scopePills .scopePill.MuiToggleButton-root { margin: 0; border: 1px solid …; border-radius: 24px }`) applied to
 * (a) the MUI-backed DOM Vanguard shipped (ComponentContainer wrappers around MUI's group/buttons) and (b) the
 * own-core group. Each pill must sit at the same offset inside its group.
 */
export default {
  ...SbDecorator({ title: 'Vanguard/ToggleButtonGroup/Consumer Override Parity', component: ToggleButtonGroup }),
};

type Story = StoryObj<typeof ToggleButtonGroup>;

const css = `
.scopePills { flex-wrap: wrap; gap: 4px; }
.scopePills .scopePill.MuiToggleButton-root {
  margin: 0; padding: 8px 12px; border: 1px solid transparent; border-radius: 24px;
  background-color: #eee; color: #333; text-transform: none;
}
`;

const labels = ['User logs', 'Admin logs', 'All'];

const Legacy = () => (
  <ComponentContainer className="ToggleButtonGroup-container">
    <MuiToggleButtonGroup value="User logs" exclusive className="scopePills" aria-label="legacy">
      {labels.map((l) => (
        <ComponentContainer key={l} className="ToggleButton-container">
          <MuiToggleButton value={l} className="scopePill">
            {l}
          </MuiToggleButton>
        </ComponentContainer>
      ))}
    </MuiToggleButtonGroup>
  </ComponentContainer>
);

const Own = () => (
  <ToggleButtonGroup value="User logs" exclusive className="scopePills" aria-label="own">
    {labels.map((l) => (
      <ToggleButton key={l} value={l} className="scopePill">
        {l}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
);

const groupBox = (group: HTMLElement) => {
  const host = group.parentElement as HTMLElement;
  const h = host.getBoundingClientRect();
  const g = group.getBoundingClientRect();
  const s = getComputedStyle(group);
  return {
    x: Math.round((g.left - h.left) * 10) / 10,
    y: Math.round((g.top - h.top) * 10) / 10,
    w: Math.round(g.width * 10) / 10,
    h: Math.round(g.height * 10) / 10,
    margin: s.margin,
    padding: s.padding,
    border: s.borderLeftWidth,
    display: s.display,
    va: s.verticalAlign,
    hostDisplay: getComputedStyle(host).display,
  };
};

const offsets = (group: HTMLElement) => {
  const g = group.getBoundingClientRect();
  return [...group.querySelectorAll<HTMLElement>('button')].map((b) => {
    const r = b.getBoundingClientRect();
    const s = getComputedStyle(b);
    return {
      x: Math.round((r.left - g.left) * 10) / 10,
      w: Math.round(r.width * 10) / 10,
      ml: s.marginLeft,
      bl: s.borderLeftWidth,
    };
  });
};

export const LogsPageScopePillsMatchLegacy: Story = {
  render: () => (
    <div>
      <style>{css}</style>
      <Legacy />
      <div style={{ height: 16 }} />
      <Own />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const legacy = offsets(c.getByRole('group', { name: 'legacy' }));
    const own = offsets(c.getByRole('group', { name: 'own' }));
    await expect(own).toEqual(legacy);
    await expect(groupBox(c.getByRole('group', { name: 'own' }))).toEqual(
      groupBox(c.getByRole('group', { name: 'legacy' })),
    );
  },
};

/**
 * AgentChatAdminSettingsModal (verifier Tier B): `.optionGroup .ToggleButton-container .MuiToggleButtonGroup-grouped
 * { margin-left: 0; border: 1px solid <divider> }` (0,3,0). MUI's `.lastButton.Mui-disabled { border-left: 1px solid
 * transparent }` (0,3,0) won that tie because emotion was injected last; the own core must give the same borders.
 */
const css2 = `
.optionGroup { flex-wrap: wrap; gap: 4px; }
.optionGroup .ToggleButton-container .MuiToggleButtonGroup-grouped { margin-left: 0; border: 1px solid rgb(200, 0, 0); border-radius: 8px; }
`;
const opts = ['A', 'B', 'C'];

const LegacyOptions = () => (
  <ComponentContainer className="ToggleButtonGroup-container">
    <MuiToggleButtonGroup value="A" exclusive className="optionGroup" aria-label="legacy-opts">
      {opts.map((o) => (
        <ComponentContainer key={o} className="ToggleButton-container">
          <MuiToggleButton value={o} disabled={o !== 'A'}>
            {o}
          </MuiToggleButton>
        </ComponentContainer>
      ))}
    </MuiToggleButtonGroup>
  </ComponentContainer>
);

const OwnOptions = () => (
  <ToggleButtonGroup value="A" exclusive className="optionGroup" aria-label="own-opts">
    {opts.map((o) => (
      <ToggleButton key={o} value={o} disabled={o !== 'A'}>
        {o}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
);

const borders = (group: HTMLElement) =>
  [...group.querySelectorAll<HTMLElement>('button')].map((b) => {
    const s = getComputedStyle(b);
    return {
      l: `${s.borderLeftWidth} ${s.borderLeftStyle} ${s.borderLeftColor}`,
      t: `${s.borderTopWidth} ${s.borderTopColor}`,
      ml: s.marginLeft,
    };
  });

export const AgentChatAdminOptionChipsMatchLegacy: Story = {
  render: () => (
    <div>
      <style>{css2}</style>
      <LegacyOptions />
      <div style={{ height: 16 }} />
      <OwnOptions />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(borders(c.getByRole('group', { name: 'own-opts' }))).toEqual(
      borders(c.getByRole('group', { name: 'legacy-opts' })),
    );
  },
};
