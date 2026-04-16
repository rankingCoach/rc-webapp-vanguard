import { SbDecorator } from "@test-utils/get-storybook-decorator";
import React, { useState } from "react";
import { StoryObj } from "@storybook/react";
import { Tabs, TabsProps } from "./Tabs";
import { within, expect, userEvent } from "storybook/test";

export default {
  ...SbDecorator({
    title: "Vanguard/Tabs",
    component: Tabs,
    extra: {
      args: {
        tabs: [
          {
            label: "General keywords",
            component: <h2>General keywords tab</h2>,
          },
          {
            label: "Negative keywords",
            component: <h2>Negative keywords tab</h2>,
          },
          {
            label: "Brand keywords",
            component: <h2>Brand keywords tab</h2>,
          },
        ],
      },
    },
  }),
};

type Story = StoryObj<typeof Tabs>;

// Controlled wrapper for interactive demos
const TabsDemo = ({
  tabs,
  tabConfig,
  wrapperStyle,
}: Pick<TabsProps, "tabs" | "tabConfig"> & { wrapperStyle?: React.CSSProperties }) => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div style={{ width: "800px", padding: "24px", ...wrapperStyle }}>
      <Tabs
        tabs={tabs}
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        tabConfig={tabConfig}
        testId="story-tabs"
      />
    </div>
  );
};

const defaultTabs: TabsProps["tabs"] = [
  {
    label: "General keywords",
    component: (
      <div style={{ padding: "24px" }}>
        <h3>General keywords</h3>
        <p>Manage the generic keywords that describe your business.</p>
      </div>
    ),
    value: 0,
  },
  {
    label: "Negative keywords",
    component: (
      <div style={{ padding: "24px" }}>
        <h3>Negative keywords</h3>
        <p>Exclude unwanted search terms from your campaigns.</p>
      </div>
    ),
    value: 1,
  },
  {
    label: "Brand keywords",
    component: (
      <div style={{ padding: "24px" }}>
        <h3>Brand keywords</h3>
        <p>Keywords specifically tied to your brand identity.</p>
      </div>
    ),
    value: 2,
  },
];

// ─── Default ────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "1112px", height: "718px", textAlign: "center", paddingTop: "50px" }}>
      <Tabs {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabElements = canvas.getAllByRole("tab");
    await expect(tabElements).toHaveLength(3);
    await expect(tabElements[0]).toHaveTextContent("General keywords");
    await expect(tabElements[1]).toHaveTextContent("Negative keywords");
    await expect(tabElements[2]).toHaveTextContent("Brand keywords");
  },
};

// ─── Themes ─────────────────────────────────────────────────────────────────

export const HighlightTheme: Story = {
  name: "Theme: Highlight (default)",
  render: () => <TabsDemo tabs={defaultTabs} tabConfig={{ theme: "highlight" }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole("tab");
    await expect(tabs).toHaveLength(3);
    await userEvent.click(tabs[1]);
    await expect(canvas.getByText("Negative keywords")).toBeInTheDocument();
  },
};

export const UnderlineTheme: Story = {
  name: "Theme: Underline",
  render: () => <TabsDemo tabs={defaultTabs} tabConfig={{ theme: "underline" }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole("tab");
    await expect(tabs).toHaveLength(3);
    await userEvent.click(tabs[2]);
    await expect(canvas.getByText("Brand keywords")).toBeInTheDocument();
  },
};

// ─── Heights ─────────────────────────────────────────────────────────────────

export const TallHeight: Story = {
  name: "Height: Tall (default)",
  render: () => <TabsDemo tabs={defaultTabs} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("tab")).toHaveLength(3);
  },
};

export const SmallHeight: Story = {
  name: "Height: Small",
  render: () => <TabsDemo tabs={defaultTabs} tabConfig={{ tabHeight: "small" }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole("tab");
    await expect(tabs).toHaveLength(3);
    await userEvent.click(tabs[1]);
    await expect(canvas.getByText("Negative keywords")).toBeInTheDocument();
  },
};

// ─── Padding ─────────────────────────────────────────────────────────────────

export const DefaultPadding: Story = {
  name: "Padding: Default",
  render: () => <TabsDemo tabs={defaultTabs} tabConfig={{ padding: "default" }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("tab")).toHaveLength(3);
  },
};

export const SmallPadding: Story = {
  name: "Padding: Small",
  render: () => <TabsDemo tabs={defaultTabs} tabConfig={{ padding: "small" }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("tab")).toHaveLength(3);
  },
};

// ─── Text Transform ───────────────────────────────────────────────────────────

export const TextTransformNone: Story = {
  name: "Text Transform: None",
  render: () => (
    <TabsDemo
      tabs={defaultTabs}
      tabConfig={{ tabTextTransform: "none" }}
    />
  ),
};

export const TextTransformCapitalize: Story = {
  name: "Text Transform: Capitalize",
  render: () => (
    <TabsDemo
      tabs={[
        { label: "general keywords", component: <div style={{ padding: "24px" }}>General</div>, value: 0 },
        { label: "negative keywords", component: <div style={{ padding: "24px" }}>Negative</div>, value: 1 },
        { label: "brand keywords", component: <div style={{ padding: "24px" }}>Brand</div>, value: 2 },
      ]}
      tabConfig={{ tabTextTransform: "capitalize" }}
    />
  ),
};

export const TextTransformUppercase: Story = {
  name: "Text Transform: Uppercase",
  render: () => (
    <TabsDemo
      tabs={defaultTabs}
      tabConfig={{ tabTextTransform: "uppercase" }}
    />
  ),
};

export const TextTransformLowercase: Story = {
  name: "Text Transform: Lowercase",
  render: () => (
    <TabsDemo
      tabs={[
        { label: "GENERAL KEYWORDS", component: <div style={{ padding: "24px" }}>General</div>, value: 0 },
        { label: "NEGATIVE KEYWORDS", component: <div style={{ padding: "24px" }}>Negative</div>, value: 1 },
        { label: "BRAND KEYWORDS", component: <div style={{ padding: "24px" }}>Brand</div>, value: 2 },
      ]}
      tabConfig={{ tabTextTransform: "lowercase" }}
    />
  ),
};

// ─── Width / Grow ─────────────────────────────────────────────────────────────

export const NoMinWidth: Story = {
  name: "Tab Width: No Min Width",
  render: () => (
    <TabsDemo
      tabs={[
        { label: "A", component: <div style={{ padding: "24px" }}>Tab A</div>, value: 0 },
        { label: "B", component: <div style={{ padding: "24px" }}>Tab B</div>, value: 1 },
        { label: "C", component: <div style={{ padding: "24px" }}>Tab C</div>, value: 2 },
      ]}
      tabConfig={{ tabNoMinWidth: true }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("tab")).toHaveLength(3);
  },
};

export const TabGrow: Story = {
  name: "Tab Width: Grow to Fill",
  render: () => (
    <TabsDemo
      tabs={defaultTabs}
      tabConfig={{ tabGrow: true }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("tab")).toHaveLength(3);
  },
};

// ─── Alignment ────────────────────────────────────────────────────────────────

export const AlignCenter: Story = {
  name: "Alignment: Center",
  render: () => (
    <TabsDemo
      tabs={defaultTabs}
      tabConfig={{ alignCenter: true }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("tab")).toHaveLength(3);
  },
};

// ─── Combined Variants ────────────────────────────────────────────────────────

export const CompactVariant: Story = {
  name: "Combined: Compact (small height + small padding + no min width)",
  render: () => (
    <TabsDemo
      tabs={defaultTabs}
      tabConfig={{
        tabHeight: "small",
        padding: "small",
        tabNoMinWidth: true,
        iconSize: "small",
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole("tab");
    await expect(tabs).toHaveLength(3);
    await userEvent.click(tabs[1]);
    await expect(canvas.getByText("Negative keywords")).toBeInTheDocument();
  },
};

export const UnderlineCompact: Story = {
  name: "Combined: Underline + Small Height + Small Padding",
  render: () => (
    <TabsDemo
      tabs={defaultTabs}
      tabConfig={{
        theme: "underline",
        tabHeight: "small",
        padding: "small",
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole("tab");
    await expect(tabs).toHaveLength(3);
    await userEvent.click(tabs[2]);
    await expect(canvas.getByText("Brand keywords")).toBeInTheDocument();
  },
};

export const UnderlineUppercase: Story = {
  name: "Combined: Underline + Uppercase",
  render: () => (
    <TabsDemo
      tabs={defaultTabs}
      tabConfig={{
        theme: "underline",
        tabTextTransform: "uppercase",
      }}
    />
  ),
};

export const HighlightSmallCentered: Story = {
  name: "Combined: Highlight + Small + Centered",
  render: () => (
    <TabsDemo
      tabs={defaultTabs}
      tabConfig={{
        theme: "highlight",
        tabHeight: "small",
        padding: "small",
        alignCenter: true,
      }}
    />
  ),
};

// ─── Two Tabs ─────────────────────────────────────────────────────────────────

export const TwoTabs: Story = {
  render: () => (
    <TabsDemo
      tabs={[
        { label: "Tab One", component: <div style={{ padding: "24px" }}>Content for tab one</div>, value: 0 },
        { label: "Tab Two", component: <div style={{ padding: "24px" }}>Content for tab two</div>, value: 1 },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole("tab");
    await expect(tabs).toHaveLength(2);
    await expect(tabs[0]).toHaveTextContent("Tab One");
    await expect(tabs[1]).toHaveTextContent("Tab Two");
  },
};

// ─── Many tabs (scroll) ────────────────────────────────────────────────────────

export const ManyTabs: Story = {
  name: "Scrollable: Many Tabs",
  render: () => (
    <TabsDemo
      tabs={Array.from({ length: 10 }, (_, i) => ({
        label: `Tab ${i + 1}`,
        component: (
          <div style={{ padding: "24px" }}>
            <h3>Content for Tab {i + 1}</h3>
          </div>
        ),
        value: i,
      }))}
      wrapperStyle={{ width: "500px" }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole("tab");
    await expect(tabs).toHaveLength(10);
  },
};

export const ManyTabsSmall: Story = {
  name: "Scrollable: Many Tabs Small",
  render: () => (
    <TabsDemo
      tabs={Array.from({ length: 10 }, (_, i) => ({
        label: `Tab ${i + 1}`,
        component: (
          <div style={{ padding: "24px" }}>
            <h3>Content for Tab {i + 1}</h3>
          </div>
        ),
        value: i,
      }))}
      tabConfig={{ tabHeight: "small" }}
      wrapperStyle={{ width: "500px" }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole("tab");
    await expect(tabs).toHaveLength(10);
  },
};
