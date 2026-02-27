import React from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '@vanguard/Button';
import { PageSection, PageSectionBackground, PageSectionRoundedEdges } from '../PageSection';
import type { Story } from './_PageSection.default';

/**
 * GradientRc breakpoint tests.
 * Covers every realistic way the inline SVG gradient background can break.
 */
export const GradientRcBreaks: Story = {
  render: () => {
    const refSpy = (node?: Element | null) => {
      (window as any).__ps_gradient_ref__ = node;
    };

    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
        {/* 1. Basic: SVG renders inside the container */}
        <PageSection
          testId="GRC_Basic"
          title="Basic gradientRc"
          background={PageSectionBackground.gradientRc}
          roundedEdges={PageSectionRoundedEdges.both}
        >
          <div>Basic gradient content</div>
        </PageSection>

        {/* 2. No SVG leak: other backgrounds must NOT contain the SVG */}
        <PageSection
          testId="GRC_NoLeak_FunctionalBg"
          title="FunctionalBg (no SVG)"
          background={PageSectionBackground.functionalBg}
        >
          <div>Should have no SVG</div>
        </PageSection>

        <PageSection
          testId="GRC_NoLeak_Transparent"
          title="Transparent (no SVG)"
          background={PageSectionBackground.transparent}
        >
          <div>Should have no SVG</div>
        </PageSection>

        {/* 3. Content above SVG: children must be interactive */}
        <PageSection
          testId="GRC_Interactive"
          title="Interactive content above SVG"
          background={PageSectionBackground.gradientRc}
          headerActionArea={<Button testId="GRC_ActionBtn">Click me</Button>}
        >
          <button data-testid="GRC_ChildBtn" type="button" onClick={() => {
            (window as any).__ps_gradient_clicked__ = true;
          }}>
            Clickable child
          </button>
        </PageSection>

        {/* 4. Multiple instances: gradient IDs must not collide */}
        <PageSection
          testId="GRC_Multi_A"
          title="Multi A"
          background={PageSectionBackground.gradientRc}
        >
          <div>Instance A</div>
        </PageSection>

        <PageSection
          testId="GRC_Multi_B"
          title="Multi B"
          background={PageSectionBackground.gradientRc}
        >
          <div>Instance B</div>
        </PageSection>

        {/* 5. roundedEdges + gradientRc: overflow clips, classes apply */}
        <PageSection
          testId="GRC_RoundedBoth"
          title="Rounded both"
          background={PageSectionBackground.gradientRc}
          roundedEdges={PageSectionRoundedEdges.both}
        >
          <div>Rounded both content</div>
        </PageSection>

        <PageSection
          testId="GRC_RoundedTop"
          title="Rounded top"
          background={PageSectionBackground.gradientRc}
          roundedEdges={PageSectionRoundedEdges.top}
        >
          <div>Rounded top content</div>
        </PageSection>

        {/* 6. innerRef still receives the container node */}
        <PageSection
          testId="GRC_InnerRef"
          background={PageSectionBackground.gradientRc}
          innerRef={refSpy}
        >
          <div>InnerRef test</div>
        </PageSection>

        {/* 7. isVisible=false: nothing in DOM at all */}
        <PageSection
          testId="GRC_Hidden"
          isVisible={false}
          background={PageSectionBackground.gradientRc}
          title="Should not exist"
        >
          <div>Hidden gradient body</div>
        </PageSection>

        {/* 8. noDefaultPadding + gradientRc */}
        <PageSection
          testId="GRC_NoPadding"
          background={PageSectionBackground.gradientRc}
          noDefaultPadding
        >
          <div>No padding content</div>
        </PageSection>

        {/* 9. className merging + gradientRc */}
        <PageSection
          testId="GRC_CustomClass"
          background={PageSectionBackground.gradientRc}
          className="my-gradient-extra"
        >
          <div>Custom class content</div>
        </PageSection>

        {/* 10. Children testId suffix still works */}
        <PageSection
          testId="GRC_ChildrenSuffix"
          background={PageSectionBackground.gradientRc}
        >
          <div>ChildrenSuffix body</div>
        </PageSection>
      </div>
    );
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // ── 1. SVG renders inside the gradientRc container ──────────────
    const basic = canvas.getByTestId('GRC_Basic');
    const basicSvg = basic.querySelector('svg');
    await expect(basicSvg).not.toBeNull();
    await expect(basicSvg!.getAttribute('aria-hidden')).toBe('true');
    await expect(basic.className).toContain('gradientRc');

    // SVG must contain <defs> with radialGradient definitions
    const defs = basicSvg!.querySelector('defs');
    await expect(defs).not.toBeNull();
    const gradients = defs!.querySelectorAll('radialGradient');
    await expect(gradients.length).toBe(11);

    // ── 2. No SVG leak into non-gradientRc backgrounds ─────────────
    const fnBg = canvas.getByTestId('GRC_NoLeak_FunctionalBg');
    await expect(fnBg.querySelector('svg')).toBeNull();
    await expect(fnBg.className).toContain('functionalBg');
    await expect(fnBg.className).not.toContain('gradientRc');

    const transparentBg = canvas.getByTestId('GRC_NoLeak_Transparent');
    await expect(transparentBg.querySelector('svg')).toBeNull();

    // ── 3. Content is interactive above the SVG ─────────────────────
    const childBtn = canvas.getByTestId('GRC_ChildBtn');
    await userEvent.click(childBtn);
    await expect((window as any).__ps_gradient_clicked__).toBe(true);

    const actionBtn = canvas.getByTestId('GRC_ActionBtn');
    await expect(actionBtn).toBeInTheDocument();

    // ── 4. Multiple instances have unique gradient IDs ──────────────
    const multiA = canvas.getByTestId('GRC_Multi_A');
    const multiB = canvas.getByTestId('GRC_Multi_B');

    const svgA = multiA.querySelector('svg')!;
    const svgB = multiB.querySelector('svg')!;
    await expect(svgA).not.toBeNull();
    await expect(svgB).not.toBeNull();

    // First radialGradient id must differ between instances
    const idA = svgA.querySelector('radialGradient')!.id;
    const idB = svgB.querySelector('radialGradient')!.id;
    await expect(idA).not.toBe(idB);

    // Each rect's fill url must reference its own SVG's gradient id
    const rectA = svgA.querySelectorAll('rect')[2]; // first rect using url(#...)
    await expect(rectA.getAttribute('fill')).toContain(idA);

    const rectB = svgB.querySelectorAll('rect')[2];
    await expect(rectB.getAttribute('fill')).toContain(idB);

    // ── 5. roundedEdges classes coexist with gradientRc ─────────────
    const roundedBoth = canvas.getByTestId('GRC_RoundedBoth');
    await expect(roundedBoth.className).toContain('gradientRc');
    await expect(roundedBoth.className).toContain('roundedTop');
    await expect(roundedBoth.className).toContain('roundedBottom');
    await expect(roundedBoth.querySelector('svg')).not.toBeNull();

    const roundedTop = canvas.getByTestId('GRC_RoundedTop');
    await expect(roundedTop.className).toContain('roundedTop');
    await expect(roundedTop.className).not.toContain('roundedBottom');

    // ── 6. innerRef receives the container node ─────────────────────
    const refNode = (window as any).__ps_gradient_ref__;
    await expect(refNode).toBeTruthy();
    await expect(refNode.querySelector('svg')).not.toBeNull();

    // ── 7. isVisible=false: nothing in DOM ──────────────────────────
    await expect(canvas.queryByTestId('GRC_Hidden')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Hidden gradient body')).not.toBeInTheDocument();

    // ── 8. noDefaultPadding: no padding class, SVG still present ────
    const noPadding = canvas.getByTestId('GRC_NoPadding');
    await expect(noPadding.className).toContain('gradientRc');
    await expect(noPadding.className).not.toContain('defaultPadding');
    await expect(noPadding.querySelector('svg')).not.toBeNull();

    // ── 9. className merging with gradientRc ────────────────────────
    const customClass = canvas.getByTestId('GRC_CustomClass');
    await expect(customClass.className).toContain('gradientRc');
    await expect(customClass.className).toContain('my-gradient-extra');

    // ── 10. Children testId suffix still works ──────────────────────
    await expect(canvas.getByTestId('GRC_ChildrenSuffix_Children')).toBeInTheDocument();

    // ── 11. SVG positioning: absolute, full-cover, non-interactive ──
    const svgEl = basic.querySelector('svg')!;
    const svgStyle = window.getComputedStyle(svgEl);
    await expect(svgStyle.position).toBe('absolute');
    await expect(svgStyle.pointerEvents).toBe('none');

    // Container must have relative positioning for the absolute SVG
    const containerStyle = window.getComputedStyle(basic);
    await expect(containerStyle.position).toBe('relative');
    await expect(containerStyle.overflow).toBe('hidden');
  },
};