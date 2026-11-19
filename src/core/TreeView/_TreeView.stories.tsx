import type { StoryObj } from "@storybook/react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";
import React, { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { Icon } from "../Icon/Icon";
import { IconNames } from "../Icon/IconNames";
import { TreeItem } from "./TreeItem";
import { TreeView } from "./TreeView";

type Story = StoryObj<typeof TreeView>;

const Items = () => (
  <>
    <TreeItem nodeId="home" label="Home">
      <TreeItem nodeId="home.hero" label="Hero section">
        <TreeItem nodeId="home.hero.title" label="title: Welcome" />
        <TreeItem nodeId="home.hero.image" label="image: hero.png" />
      </TreeItem>
      <TreeItem nodeId="home.contact" label="Contact section" />
    </TreeItem>
    <TreeItem nodeId="about" label="About" icon={<Icon>{IconNames.info}</Icon>} />
    <TreeItem nodeId="legal" label="Legal (disabled)" disabled>
      <TreeItem nodeId="legal.imprint" label="Imprint" />
    </TreeItem>
  </>
);

export const Default: Story = {
  render: () => (
    <TreeView aria-label="pages" defaultExpanded={["home"]}>
      <Items />
    </TreeView>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("tree", { name: "pages" })).toBeInTheDocument();
    await userEvent.click(canvas.getByTestId("tree-item-home.hero-content"));
    await expect(canvas.getByText("title: Welcome")).toBeVisible();
    await expect(canvas.getByTestId("tree-item-home.hero")).toHaveAttribute("aria-selected", "true");
  },
};

const ControlledTree = () => {
  const [expanded, setExpanded] = useState<string[]>(["home", "home.hero"]);
  const [selected, setSelected] = useState<string>("home.hero.title");
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <TreeView
        aria-label="controlled pages"
        expanded={expanded}
        onNodeToggle={(_event, nodeIds) => setExpanded(nodeIds)}
        selected={selected}
        onNodeSelect={(_event, nodeId) => setSelected(nodeId)}
        showIndentGuide
        dense
      >
        <Items />
      </TreeView>
      <span data-testid="selected">{selected}</span>
    </div>
  );
};

export const ControlledDenseWithIndentGuide: Story = {
  render: () => <ControlledTree />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("tree-item-home.contact-content"));
    await expect(canvas.getByTestId("selected")).toHaveTextContent("home.contact");
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByTestId("tree-item-home.hero.image")).toHaveFocus();
  },
};

export default {
  ...SbDecorator({
    title: "Vanguard/TreeView",
    component: TreeView,
  }),
};
