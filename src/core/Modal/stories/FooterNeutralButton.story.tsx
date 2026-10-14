import React from "react";
import { ModalFooter } from "@vanguard/Modal/ModalFooter/ModalFooter";
import { Story } from "./_Modal.default";

/**
 * Static render of the ModalFooter: the neutral (middle) button has no explicit `type`,
 * so it falls back to the default muted button.
 */
export const FooterNeutralButton: Story = {
  args: {},
  render: () => (
    <ModalFooter
      negative={{ text: "Cancel", cta: () => {} }}
      neutral={{ text: "Save draft", cta: () => {} }}
      positive={{ text: "Publish", cta: () => {} }}
    />
  ),
};
