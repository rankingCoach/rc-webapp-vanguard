import React from "react";
import { expect } from "storybook/test";
import { ButtonTypes } from "@vanguard/Button/Button";
import { ModalFooter } from "@vanguard/Modal/ModalFooter/ModalFooter";
import { Story } from "./_Modal.default";

type FooterCombo = { negative?: ButtonTypes; neutral?: ButtonTypes; positive?: ButtonTypes };

// Undefined slots use the footer defaults (negative: default, neutral: muted, positive: primary)
const COMBOS: FooterCombo[] = [
  {},
  { neutral: ButtonTypes.muted },
  { negative: ButtonTypes.muted, neutral: ButtonTypes.muted },
  { neutral: ButtonTypes.shimmer, positive: ButtonTypes.muted },
  { negative: ButtonTypes.muted, neutral: ButtonTypes.default, positive: ButtonTypes.shimmer },
  { neutral: ButtonTypes.secondary },
  { neutral: ButtonTypes.primary, positive: ButtonTypes.muted },
];

const label = (type?: ButtonTypes) => type ?? "default type";

/**
 * Every button in a ModalFooter renders at the same height whatever its type: the footer sizes muted actions
 * `extraLarge` and the others `medium`, which are both 48px on desktop and 40px on mobile.
 */
export const FooterButtonHeights: Story = {
  args: {},
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {COMBOS.map((combo, idx) => (
        <div key={idx} data-testid={`footer-combo-${idx}`}>
          <ModalFooter
            showTopBorder
            negative={{ text: `Cancel (${label(combo.negative)})`, cta: () => {}, type: combo.negative }}
            neutral={{ text: `Save draft (${label(combo.neutral)})`, cta: () => {}, type: combo.neutral }}
            positive={{ text: `Publish (${label(combo.positive)})`, cta: () => {}, type: combo.positive }}
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Row height for the current breakpoint (mobile is 767px and below)
    const expectedHeight = window.innerWidth > 767 ? 48 : 40;
    const getFooterButtons = (idx: number) =>
      Array.from(canvasElement.querySelectorAll<HTMLButtonElement>(`[data-testid="footer-combo-${idx}"] button`));

    for (let idx = 0; idx < COMBOS.length; idx++) {
      const heights = getFooterButtons(idx).map((button) => Math.round(button.getBoundingClientRect().height));

      await expect(heights).toEqual([expectedHeight, expectedHeight, expectedHeight]);
    }

    // The neutral default (combo 0) renders the same as an explicit muted neutral (combo 1)
    const [, defaultNeutral] = getFooterButtons(0);
    const [, mutedNeutral] = getFooterButtons(1);
    await expect(getComputedStyle(defaultNeutral).backgroundColor).toBe(getComputedStyle(mutedNeutral).backgroundColor);
  },
};
