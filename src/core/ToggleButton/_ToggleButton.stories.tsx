import { SbDecorator } from "@test-utils/get-storybook-decorator";
import React, { useState } from "react";
import { StoryObj } from "@storybook/react";
import { ToggleButton } from "./ToggleButton";
import { within, expect, userEvent, fn } from "storybook/test";
import { Icon } from "@vanguard/Icon/Icon";
import { IconNames } from "@vanguard/Icon/IconNames";

export default {
  ...SbDecorator({
    title: "Vanguard/ToggleButton",
    component: ToggleButton,
    extra: {
      args: {
        value: "toggle",
        children: "Toggle Me",
        selected: false,
      },
    },
  }),
};

type Story = StoryObj<typeof ToggleButton>;

const mockOnChange = fn();

export const Default: Story = {
  args: {
    onChange: mockOnChange,
    testId: "default-toggle",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId("default-toggle");
    await expect(container).toBeInTheDocument();

    const toggleButton = canvas.getByText("Toggle Me");
    await expect(toggleButton).toBeInTheDocument();
  },
};

export const Selected: Story = {
  args: {
    selected: true,
    children: "Selected Toggle",
    onChange: mockOnChange,
    testId: "selected-toggle",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleButton = canvas.getByText("Selected Toggle");
    await expect(toggleButton).toBeInTheDocument();

    // Check if it has selected styling
    const button = toggleButton.closest("button");
    await expect(button).toHaveClass("Mui-selected");
  },
};

export const WithIcon: Story = {
  args: {
    value: "edit",
    children: <Icon testId="edit-icon">{IconNames.edit}</Icon>,
    selected: false,
    onChange: mockOnChange,
    testId: "icon-toggle",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId("icon-toggle");
    await expect(container).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled Toggle",
    onChange: mockOnChange,
    testId: "disabled-toggle",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleButton = canvas.getByText("Disabled Toggle");
    const button = toggleButton.closest("button");
    await expect(button).toBeDisabled();
  },
};

export const ColorVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "10px", padding: "20px" }}>
      <ToggleButton value="primary" color="primary" selected testId="primary-toggle">
        Primary
      </ToggleButton>
      <ToggleButton value="secondary" color="secondary" selected testId="secondary-toggle">
        Secondary
      </ToggleButton>
      <ToggleButton value="error" color="error" selected testId="error-toggle">
        Error
      </ToggleButton>
      <ToggleButton value="warning" color="warning" selected testId="warning-toggle">
        Warning
      </ToggleButton>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const primaryButton = canvas.getByText("Primary");
    const secondaryButton = canvas.getByText("Secondary");

    await expect(primaryButton).toBeInTheDocument();
    await expect(secondaryButton).toBeInTheDocument();
  },
};

export const InteractiveExample: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);

    const handleToggle = (value: string) => {
      const currentIndex = selected.indexOf(value);
      const newSelected = [...selected];

      if (currentIndex === -1) {
        newSelected.push(value);
      } else {
        newSelected.splice(currentIndex, 1);
      }

      setSelected(newSelected);
    };

    return (
      <div style={{ padding: "20px" }}>
        <h3>Text Formatting</h3>
        <div style={{ display: "flex", gap: "5px", marginBottom: "20px" }}>
          <ToggleButton
            value="bold"
            selected={selected.includes("bold")}
            onChange={() => handleToggle("bold")}
            testId="bold-toggle"
          >
            <Icon testId="text-icon">{IconNames.text}</Icon>
          </ToggleButton>
          <ToggleButton
            value="italic"
            selected={selected.includes("italic")}
            onChange={() => handleToggle("italic")}
            testId="italic-toggle"
          >
            <Icon testId="edit-icon">{IconNames.edit}</Icon>
          </ToggleButton>
          <ToggleButton
            value="underlined"
            selected={selected.includes("underlined")}
            onChange={() => handleToggle("underlined")}
            testId="underline-toggle"
          >
            <Icon testId="rewrite-icon">{IconNames.rewrite}</Icon>
          </ToggleButton>
        </div>
        <div style={{ padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
          <strong>Selected formats:</strong> {selected.length > 0 ? selected.join(", ") : "None"}
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boldContainer = canvas.getByTestId("bold-toggle");
    const italicContainer = canvas.getByTestId("italic-toggle");

    const boldButton = within(boldContainer).getByRole('button');
    const italicButton = within(italicContainer).getByRole('button');

    await expect(boldButton).toBeInTheDocument();
    await expect(italicButton).toBeInTheDocument();

    // Click bold button
    await userEvent.click(boldButton);
    const selectedText = canvas.getByText('bold');
    await expect(selectedText).toBeInTheDocument();
  },
};
// A single Icon child marks the button icon-only (ToggleButton-icon-only), so a segmented group can square it
export const IconOnlyMarker: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "10px" }}>
      <ToggleButton value="grid" aria-label="Grid view" testId="icon-only-toggle">
        <Icon>{IconNames.image}</Icon>
      </ToggleButton>
      <ToggleButton value="text" testId="text-toggle">
        Text
      </ToggleButton>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const iconButton = within(canvas.getByTestId("icon-only-toggle")).getByRole("button");
    const textButton = within(canvas.getByTestId("text-toggle")).getByRole("button");

    await expect(iconButton).toHaveClass("ToggleButton-icon-only");
    await expect(textButton).not.toHaveClass("ToggleButton-icon-only");
  },
};
