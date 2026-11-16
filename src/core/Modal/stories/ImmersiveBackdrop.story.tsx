import React from "react";
import { userEvent, within, expect, screen, waitFor } from "storybook/test";
import { ModalService } from "@vanguard/Modal/ModalService";
import { Modal } from "@vanguard/Modal/Modal";
import { ModalBody } from "@vanguard/Modal/ModalBody/ModalBody";
import { Button, ButtonSizes, ButtonTypes } from "@vanguard/Button/Button";
import { Text, TextTypes, FontWeights } from "@vanguard/Text/Text";
import { Story, closeAllModals } from "./_Modal.default";

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
      </div>
    );
  },
};
