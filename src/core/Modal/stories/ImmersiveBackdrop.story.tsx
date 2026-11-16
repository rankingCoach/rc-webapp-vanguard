import React from "react";
import { userEvent, within, expect, screen, waitFor } from "storybook/test";
import { ModalService } from "@vanguard/Modal/ModalService";
import { Modal } from "@vanguard/Modal/Modal";
import { ModalBody } from "@vanguard/Modal/ModalBody/ModalBody";
import { Button, ButtonSizes, ButtonTypes } from "@vanguard/Button/Button";
import { Text, TextTypes, FontWeights } from "@vanguard/Text/Text";
import { Story, closeAllModals } from "./_Modal.default";

// A page with something on it, so the frosting has what to blur.
const PAGE_TILE_COLORS = [
  "rgb(99, 102, 241)", "rgb(14, 165, 233)", "rgb(16, 185, 129)", "rgb(245, 158, 11)",
  "rgb(239, 68, 68)", "rgb(168, 85, 247)", "rgb(20, 184, 166)", "rgb(100, 116, 139)",
];

const ImmersiveModal = ({ close }: { close: () => void }) => {
  return (
    <Modal
      onClose={close}
      backdrop="immersive"
      modalPosition="center"
      fullscreen={false}
      width="560px"
      maxWidth="100%"
      testId="immersive-modal"
    >
      <ModalBody padding={0}>
        <div style={{ display: "grid", justifyItems: "center", gap: 8, textAlign: "center" }}>
          <Text type={TextTypes.heading2} fontWeight={FontWeights.bold} color="#fff">
            Drop your files here
          </Text>
          <Text color="rgba(255, 255, 255, 0.8)">Drop as many as you like, or choose them from your device.</Text>
          <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
            <Button type={ButtonTypes.muted} size={ButtonSizes.large} rounded onDark onClick={() => close()}>
              Cancel
            </Button>
            <Button type={ButtonTypes.primary} size={ButtonSizes.large} rounded onClick={() => close()}>
              Choose files
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export const ImmersiveBackdrop: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllModals();

    await userEvent.click(canvas.getByRole("button", { name: /open modal/i }));

    const modal = await screen.findByTestId("immersive-modal");
    await expect(modal).toHaveClass("modal-backdrop-immersive");
    const panel = modal.querySelector(".modal-content") as HTMLElement;
    await expect(getComputedStyle(panel).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    await expect(getComputedStyle(panel).boxShadow).toBe("none");
    await expect(getComputedStyle(modal).backgroundImage).toContain("radial-gradient");
    const modalRoot = modal.closest(".modalRoot") as HTMLElement;
    await expect(getComputedStyle(modalRoot).backgroundColor).toBe("rgba(0, 0, 0, 0)");

    await userEvent.click(screen.getByTestId("modal-close-cta"));
    await waitFor(() => expect(screen.queryByTestId("immersive-modal")).not.toBeInTheDocument());
  },
  render: () => {
    const openModal = () => {
      ModalService.open(<ImmersiveModal close={() => {}} />);
    };

    return (
      <div>
        <Button onClick={openModal}>Open Modal</Button>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 24 }}>
          {PAGE_TILE_COLORS.map((color) => (
            <div key={color} style={{ height: 180, borderRadius: 16, background: color }} />
          ))}
        </div>
      </div>
    );
  },
};
