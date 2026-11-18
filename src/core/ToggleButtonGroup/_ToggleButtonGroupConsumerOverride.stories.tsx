import { ToggleButton as MuiToggleButton, ToggleButtonGroup as MuiToggleButtonGroup } from '@mui/material';
import { StoryObj } from '@storybook/react';
import { EntryCss, RouteCss } from '@test-utils/consumer-css';
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
      <RouteCss css={css} />
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
      <EntryCss css={css2} />
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

/**
 * AgentChatAdmin, DISABLED group (verifier Tier B, reopened): AgentChatAdminSettingsModal.module.scss is in rc-webapp's
 * ENTRY chunk, so it loads before vanguard.css and emotion. MUI's `.lastButton/.middleButton.Mui-disabled
 * { border-left: 1px solid transparent }` (0,3,0) won the tie with the consumer rule (0,3,0) by coming later; the
 * own core's compat partial (appended last to vanguard.css, D15) must keep doing so. Pinned with MUI's value.
 */
export const AgentChatAdminDisabledGroupKeepsTransparentJoins: Story = {
  render: () => (
    <div>
      <EntryCss css={css2} />
      <ToggleButtonGroup value="A" exclusive disabled className="optionGroup" aria-label="own-disabled">
        {opts.map((o) => (
          <ToggleButton key={o} value={o}>
            {o}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [first, middle, last] = [
      ...within(canvasElement).getByRole('group', { name: 'own-disabled' }).querySelectorAll('button'),
    ];
    await expect(getComputedStyle(first).borderLeftColor).toBe('rgb(200, 0, 0)');
    for (const b of [middle, last]) {
      const s = getComputedStyle(b);
      await expect(s.borderLeftWidth).toBe('1px');
      await expect(s.borderLeftColor).toBe('rgba(0, 0, 0, 0)');
      await expect(s.marginLeft).toBe('0px');
    }
  },
};

/**
 * Production order, LAZY route CSS (D15, plan §21): ColorSchemeToggle (settings) and AdminColorSchemeToggle (admin
 * top nav) ship in route chunks whose `<link>` Vite appends after emotion's tag, so their (0,2,0)
 * `.x .MuiToggleButton-root { border-color; background-color }` beat MUI's (0,2,0) middle/last join
 * `border-left: 1px solid transparent` in production. An inline `<style>` in the story body sits after both the
 * Vanguard CSS and emotion's head tag, which is exactly that order. Legacy (live MUI) is the production reference;
 * the own core must paint the same borders. No rc-webapp story renders either toggle (verifier), so this is the
 * only coverage; `agentic-plans/uisdk-tools/pixel-diff.mjs` compares the two groups pixel by pixel.
 */
const cssScheme = `
.cst { display: flex; flex-direction: column; gap: 8px; }
.cst .MuiToggleButtonGroup-root { border-color: rgb(208, 213, 221); }
.cst .MuiToggleButton-root { color: rgb(102, 112, 133); border-color: rgb(208, 213, 221); background-color: rgb(255, 255, 255); }
.cst .MuiToggleButton-root.Mui-selected { color: rgb(16, 24, 40); background-color: rgb(242, 244, 247); }
.cst .MuiToggleButton-root:hover { background-color: rgb(242, 244, 247); }
.acst .MuiToggleButton-root { padding: 4px 8px; color: rgb(102, 112, 133); border-color: rgb(208, 213, 221); background-color: rgb(255, 255, 255); text-transform: none; }
.acst .MuiToggleButton-root.Mui-selected { color: rgb(16, 24, 40); background-color: rgb(242, 244, 247); }
.acst .MuiToggleButton-root:hover { background-color: rgb(242, 244, 247); }
`;
const schemes = ['light', 'dark', 'system'];

const SchemeLegacy = ({ admin }: { admin?: boolean }) => {
  const group = (
    <ComponentContainer className="ToggleButtonGroup-container">
      <MuiToggleButtonGroup
        value="dark"
        exclusive
        size={admin ? 'small' : undefined}
        className={admin ? 'acst' : undefined}
        aria-label={admin ? 'legacy-admin-scheme' : 'legacy-scheme'}
      >
        {schemes.map((s) => (
          <ComponentContainer key={s} className="ToggleButton-container">
            <MuiToggleButton value={s}>{s}</MuiToggleButton>
          </ComponentContainer>
        ))}
      </MuiToggleButtonGroup>
    </ComponentContainer>
  );
  return admin ? group : <div className="cst">{group}</div>;
};

const SchemeOwn = ({ admin }: { admin?: boolean }) => {
  const group = (
    <ToggleButtonGroup
      value="dark"
      exclusive
      size={admin ? 'small' : undefined}
      className={admin ? 'acst' : undefined}
      aria-label={admin ? 'own-admin-scheme' : 'own-scheme'}
    >
      {schemes.map((s) => (
        <ToggleButton key={s} value={s}>
          {s}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
  return admin ? group : <div className="cst">{group}</div>;
};

const schemeBorders = (group: HTMLElement) =>
  [...group.querySelectorAll<HTMLElement>('button')].map((b) => {
    const s = getComputedStyle(b);
    return {
      l: `${s.borderLeftWidth} ${s.borderLeftStyle} ${s.borderLeftColor}`,
      r: `${s.borderRightWidth} ${s.borderRightColor}`,
      ml: s.marginLeft,
      bg: s.backgroundColor,
      w: Math.round(b.getBoundingClientRect().width * 10) / 10,
    };
  });

export const ColorSchemeTogglesLazyRouteOrderMatchLegacy: Story = {
  render: () => (
    <div data-testid="scheme-fixture">
      <RouteCss css={cssScheme} />
      <SchemeLegacy />
      <div style={{ height: 16 }} />
      <SchemeOwn />
      <div style={{ height: 16 }} />
      <SchemeLegacy admin />
      <div style={{ height: 16 }} />
      <SchemeOwn admin />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(schemeBorders(c.getByRole('group', { name: 'own-scheme' }))).toEqual(
      schemeBorders(c.getByRole('group', { name: 'legacy-scheme' })),
    );
    await expect(schemeBorders(c.getByRole('group', { name: 'own-admin-scheme' }))).toEqual(
      schemeBorders(c.getByRole('group', { name: 'legacy-admin-scheme' })),
    );
    // Production value pinned (route CSS wins the (0,2,0) tie with the middle/last join): the divider stays visible.
    for (const name of ['own-scheme', 'own-admin-scheme']) {
      const [, middle, last] = schemeBorders(c.getByRole('group', { name }));
      for (const b of [middle, last]) await expect(b.l).toBe('1px solid rgb(208, 213, 221)');
    }
  },
};
