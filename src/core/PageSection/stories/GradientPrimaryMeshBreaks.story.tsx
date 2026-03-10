import React from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '@vanguard/Button';
import { PageSection, PageSectionBackground, PageSectionRoundedEdges } from '../PageSection';
import type { Story } from './_PageSection.default';

/**
 * GradientPrimaryMesh breakpoint tests.
 * Covers every realistic way the inline SVG gradient background can break.
 */
export const GradientPrimaryMeshBreaks: Story = {
  render: () => {
    const refSpy = (node?: Element | null) => {
      (window as any).__ps_gradient_ref__ = node;
    };

    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
        {/* 1. Basic: SVG renders inside the container */}
        <PageSection
          testId="GPM_Basic"
          title="Basic gradientPrimaryMesh"
          background={PageSectionBackground.gradientPrimaryMesh}
          roundedEdges={PageSectionRoundedEdges.both}
        >
          <div>Basic gradient content</div>
        </PageSection>

        {/* 2. No SVG leak: other backgrounds must NOT contain the SVG */}
        <PageSection
          testId="GPM_NoLeak_FunctionalBg"
          title="FunctionalBg (no SVG)"
          background={PageSectionBackground.functionalBg}
        >
          <div>Should have no SVG</div>
        </PageSection>

        <PageSection
          testId="GPM_NoLeak_Transparent"
          title="Transparent (no SVG)"
          background={PageSectionBackground.transparent}
        >
          <div>Should have no SVG</div>
        </PageSection>

        {/* 3. Content above SVG: children must be interactive */}
        <PageSection
          testId="GPM_Interactive"
          title="Interactive content above SVG"
          background={PageSectionBackground.gradientPrimaryMesh}
          headerActionArea={<Button testId="GPM_ActionBtn">Click me</Button>}
        >
          <button data-testid="GPM_ChildBtn" type="button" onClick={() => {
            (window as any).__ps_gradient_clicked__ = true;
          }}>
            Clickable child
          </button>
        </PageSection>

        {/* 4. Multiple instances: gradient IDs must not collide */}
        <PageSection
          testId="GPM_Multi_A"
          title="Multi A"
          background={PageSectionBackground.gradientPrimaryMesh}
        >
          <div>Instance A</div>
        </PageSection>

        <PageSection
          testId="GPM_Multi_B"
          title="Multi B"
          background={PageSectionBackground.gradientPrimaryMesh}
        >
          <div>Instance B</div>
        </PageSection>

        {/* 5. roundedEdges + gradientPrimaryMesh: overflow clips, classes apply */}
        <PageSection
          testId="GPM_RoundedBoth"
          title="Rounded both"
          background={PageSectionBackground.gradientPrimaryMesh}
          roundedEdges={PageSectionRoundedEdges.both}
        >
          <div>Rounded both content</div>
        </PageSection>

        <PageSection
          testId="GPM_RoundedTop"
          title="Rounded top"
          background={PageSectionBackground.gradientPrimaryMesh}
          roundedEdges={PageSectionRoundedEdges.top}
        >
          <div>Rounded top content</div>
        </PageSection>

        {/* 6. innerRef still receives the container node */}
        <PageSection
          testId="GPM_InnerRef"
          background={PageSectionBackground.gradientPrimaryMesh}
          innerRef={refSpy}
        >
          <div>InnerRef test</div>
        </PageSection>

        {/* 7. isVisible=false: nothing in DOM at all */}
        <PageSection
          testId="GPM_Hidden"
          isVisible={false}
          background={PageSectionBackground.gradientPrimaryMesh}
          title="Should not exist"
        >
          <div>Hidden gradient body</div>
        </PageSection>

        {/* 8. noDefaultPadding + gradientPrimaryMesh */}
        <PageSection
          testId="GPM_NoPadding"
          background={PageSectionBackground.gradientPrimaryMesh}
          noDefaultPadding
        >
          <div>No padding content</div>
        </PageSection>

        {/* 9. className merging + gradientPrimaryMesh */}
        <PageSection
          testId="GPM_CustomClass"
          background={PageSectionBackground.gradientPrimaryMesh}
          className="my-gradient-extra"
        >
          <div>Custom class content</div>
        </PageSection>

        {/* 10. Children testId suffix still works */}
        <PageSection
          testId="GPM_ChildrenSuffix"
          background={PageSectionBackground.gradientPrimaryMesh}
        >
          <div>ChildrenSuffix body</div>
        </PageSection>
      </div>
    );
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // ── 1. SVG renders inside the gradientPrimaryMesh container ──────────────
    const basic = canvas.getByTestId('GPM_Basic');
    const basicSvg = basic.querySelector('svg');
    await expect(basicSvg).not.toBeNull();
    await expect(basicSvg!.getAttribute('aria-hidden')).toBe('true');
    await expect(basic.className).toContain('gradientPrimaryMesh');

    // SVG must contain <defs> with radialGradient definitions
    const defs = basicSvg!.querySelector('defs');
    await expect(defs).not.toBeNull();
    const gradients = defs!.querySelectorAll('radialGradient');
    await expect(gradients.length).toBe(11);

    // ── 2. No SVG leak into non-gradientPrimaryMesh backgrounds ─────────────
    const fnBg = canvas.getByTestId('GPM_NoLeak_FunctionalBg');
    await expect(fnBg.querySelector('svg')).toBeNull();
    await expect(fnBg.className).toContain('functionalBg');
    await expect(fnBg.className).not.toContain('gradientPrimaryMesh');

    const transparentBg = canvas.getByTestId('GPM_NoLeak_Transparent');
    await expect(transparentBg.querySelector('svg')).toBeNull();

    // ── 3. Content is interactive above the SVG ─────────────────────
    const childBtn = canvas.getByTestId('GPM_ChildBtn');
    await userEvent.click(childBtn);
    await expect((window as any).__ps_gradient_clicked__).toBe(true);

    const actionBtn = canvas.getByTestId('GPM_ActionBtn');
    await expect(actionBtn).toBeInTheDocument();

    // ── 4. Multiple instances have unique gradient IDs ──────────────
    const multiA = canvas.getByTestId('GPM_Multi_A');
    const multiB = canvas.getByTestId('GPM_Multi_B');

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

    // ── 5. roundedEdges classes coexist with gradientPrimaryMesh ─────────────
    const roundedBoth = canvas.getByTestId('GPM_RoundedBoth');
    await expect(roundedBoth.className).toContain('gradientPrimaryMesh');
    await expect(roundedBoth.className).toContain('roundedTop');
    await expect(roundedBoth.className).toContain('roundedBottom');
    await expect(roundedBoth.querySelector('svg')).not.toBeNull();

    const roundedTop = canvas.getByTestId('GPM_RoundedTop');
    await expect(roundedTop.className).toContain('roundedTop');
    await expect(roundedTop.className).not.toContain('roundedBottom');

    // ── 6. innerRef receives the container node ─────────────────────
    const refNode = (window as any).__ps_gradient_ref__;
    await expect(refNode).toBeTruthy();
    await expect(refNode.querySelector('svg')).not.toBeNull();

    // ── 7. isVisible=false: nothing in DOM ──────────────────────────
    await expect(canvas.queryByTestId('GPM_Hidden')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Hidden gradient body')).not.toBeInTheDocument();

    // ── 8. noDefaultPadding: no padding class, SVG still present ────
    const noPadding = canvas.getByTestId('GPM_NoPadding');
    await expect(noPadding.className).toContain('gradientPrimaryMesh');
    await expect(noPadding.className).not.toContain('defaultPadding');
    await expect(noPadding.querySelector('svg')).not.toBeNull();

    // ── 9. className merging with gradientPrimaryMesh ────────────────────────
    const customClass = canvas.getByTestId('GPM_CustomClass');
    await expect(customClass.className).toContain('gradientPrimaryMesh');
    await expect(customClass.className).toContain('my-gradient-extra');

    // ── 10. Children testId suffix still works ──────────────────────
    await expect(canvas.getByTestId('GPM_ChildrenSuffix_Children')).toBeInTheDocument();

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