import React from "react";
import { userEvent, within, expect, screen, waitFor } from "storybook/test";
import { ModalService } from "@vanguard/Modal/ModalService";
import { Modal } from "@vanguard/Modal/Modal";
import { ModalBody } from "@vanguard/Modal/ModalBody/ModalBody";
import { Button } from "@vanguard/Button/Button";
import { Story, closeAllModals } from "./_Modal.default";

// Self-contained image (inline SVG data URI) so the story never depends on the
// network — keeps the browser test deterministic under the strict CSP.
const FULL_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='960' height='640'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stop-color='rgb(99,102,241)'/>
          <stop offset='1' stop-color='rgb(14,165,233)'/>
        </linearGradient>
      </defs>
      <rect width='960' height='640' fill='url(#g)'/>
      <text x='480' y='330' font-family='sans-serif' font-size='56' font-weight='700'
        fill='white' text-anchor='middle'>Full image preview</text>
    </svg>`,
  );

const FullImageModal = ({ close }: { close: () => void }) => {
  return (
    <Modal onClose={close} modalPosition={"center"} width={"640px"} testId="full-image-modal">
      <ModalBody padding={0}>
        <img
          src={FULL_IMAGE}
          alt="Full image preview"
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      </ModalBody>
    </Modal>
  );
};

export const FullImageWithCloseButton: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Close any remaining modals from previous tests
    await closeAllModals();

    // Open modal via service
    const openButton = canvas.getByRole("button", { name: /open modal/i });
    await userEvent.click(openButton);

    // The full image is shown
    await expect(await screen.findByAltText("Full image preview")).toBeInTheDocument();

    // The modal-managed close button overlays the image
    const closeButton = canvas.getByTestId("modal-close-cta");
    await userEvent.click(closeButton);

    // Verify modal is closed (close is async via setTimeout + exit animation)
    await waitFor(() =>
      expect(screen.queryByAltText("Full image preview")).not.toBeInTheDocument()
    );
  },
  render: () => {
    const openModal = () => {
      ModalService.open(<FullImageModal close={() => {}} />);
    };

    return (
      <div>
        <Button onClick={openModal}>Open Modal</Button>
      </div>
    );
  },
};
