import React from 'react';
import type { Story } from './_PageSection.default';
import { PageSection, PageSectionBackground } from '../PageSection';
import { expect, within } from 'storybook/test';

export const Backgrounds: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageSection
        testId="PS_BG_Functional"
        title="Functional background"
        background={PageSectionBackground.functionalBg}
      >
        <div>Functional background content</div>
      </PageSection>

      <PageSection
        testId="PS_BG_Frosted"
        title="Frosted glass"
        background={PageSectionBackground.frostedGlass}
      >
        <div>Frosted glass content</div>
      </PageSection>

      <PageSection
        testId="PS_BG_Transparent"
        title="Transparent"
        background={PageSectionBackground.transparent}
      >
        <div>Transparent content</div>
      </PageSection>

      <PageSection
        testId="PS_BG_GradientPrimaryMesh"
        title="Primary mesh gradient"
        background={PageSectionBackground.gradientPrimaryMesh}
      >
        <div>Gradient Primary Mesh content</div>
      </PageSection>

      <PageSection
        testId="PS_BG_GradientBgVarTop"
        title="BgVar gradient (fade top)"
        background={PageSectionBackground.gradientBgVarTop}
      >
        <div>BgVar top fade content</div>
      </PageSection>

      <PageSection
        testId="PS_BG_GradientBgVarBottom"
        title="BgVar gradient (fade bottom)"
        background={PageSectionBackground.gradientBgVarBottom}
      >
        <div>BgVar bottom fade content</div>
      </PageSection>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('PS_BG_Functional').className).toContain('functionalBg');
    await expect(canvas.getByTestId('PS_BG_Frosted').className).toContain('frostedGlass');
    await expect(canvas.getByTestId('PS_BG_Transparent').className).toContain('transparent');
    await expect(canvas.getByTestId('PS_BG_GradientPrimaryMesh').className).toContain('gradientPrimaryMesh');
    await expect(canvas.getByTestId('PS_BG_GradientBgVarTop').className).toContain('gradientBgVarTop');
    await expect(canvas.getByTestId('PS_BG_GradientBgVarBottom').className).toContain('gradientBgVarBottom');
  },
};