import React from "react";
import { Toolbar } from "../Toolbar";
import { Text, TextTypes } from "@vanguard/Text/Text";
import { IconButton } from "@vanguard/IconButton/IconButton";
import { IconNames } from "@vanguard/Icon/IconNames";
import { Button, ButtonSizes, ButtonTypes } from "@vanguard/Button/Button";
import { within, expect } from "storybook/test";
import { Story } from "./_Toolbar.default";

export const WithCustomStyling: Story = {
  render: () => (
    <Toolbar style={{ backgroundColor: "#0d47a1", color: "white" }}>
      <IconButton isActive={false} icon={IconNames.hamburgerMenu} />
      <Text type={TextTypes.heading3} style={{ flexGrow: 1, color: "white" }}>
        Custom Styled Toolbar
      </Text>
      <Button type={ButtonTypes.muted} size={ButtonSizes.extraLarge} inverted>
        Login
      </Button>
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText("Custom Styled Toolbar");
    const loginButton = canvas.getByText("Login");

    await expect(title).toBeInTheDocument();
    await expect(loginButton).toBeInTheDocument();
  },
};