import React from "react";
import { Form } from "@vanguard/Form/Form";
import { within, expect } from "storybook/test";
import { Story } from "./_Form.default";

export const BasicChildren: Story = {
  args: {
    children: (
      <>
        Plain text child
        <div data-testid="basic-children">
          <h3>Basic Form Content</h3>
          <p>This form has no form elements, just basic children.</p>
          <button data-testid="regular-button">Regular Button</button>
        </div>
      </>
    ),
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify children are rendered correctly
    const childrenContainer = canvas.getByTestId("basic-children");
    await expect(childrenContainer).toBeInTheDocument();

    await expect(canvas.getByText("Plain text child")).toBeInTheDocument();
    await expect(canvas.getByText("Basic Form Content")).toBeInTheDocument();
    await expect(canvas.getByText("This form has no form elements, just basic children.")).toBeInTheDocument();

    const button = canvas.getByTestId("regular-button");
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent("Regular Button");
  },
};
