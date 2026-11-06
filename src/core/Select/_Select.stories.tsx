import React from "react";
import { disableControls, SbDecorator } from "@test-utils/get-storybook-decorator";
import { mapStorybookActionToProps } from "@test-utils/map-storybook-action-to-props";
import {
  Select,
  SelectOptionProp,
  SelectOptionProps,
  SelectOptionsComponentProps,
  SelectProps,
} from "@vanguard/Select/Select";
import { StoryObj } from "@storybook/react";
import { expect, waitFor, within } from "storybook/test";
import { Icon } from "@vanguard/Icon/Icon";
import { IconNames } from "@vanguard/Icon/IconNames";

export default {
  ...SbDecorator({
    title: "vanguard/Select",
    component: Select,
    extra: {
      ...disableControls([""]),
    },
    opts: {
      withRedux: true,
      maxWidth: "250px",
    },
  }),
};

const options: SelectOptionProp[] = [
  {
    key: 1,
    value: "option1",
    title: "Option 1 Title",
    description: "This is a short description.",
    disabled: false,
  },
  {
    key: 2,
    value: "option2",
    title: "Option 2 Long Title",
    description: "Description with at least 40 characters to fulfill the requirement.",
    disabled: true,
  },
  {
    key: "three",
    value: 3,
    title: "Option 3 Title",
    disabled: false,
  },
  {
    key: 4,
    value: "option4",
    title: "Option 4 Longer Title",
    description: "Long description with more than 40 characters to meet the requirement.",
    disabled: true,
  },
  {
    key: "five",
    value: 5,
    title: "Option 5 Very Very Long Title",
    description: "Description with more than 40 characters to fulfill the requirement.",
    disabled: false,
  },
  {
    key: 6,
    value: "option6",
    title: "Option 6 Medium Title",
    disabled: true,
  },
  {
    key: "seven",
    value: 7,
    title: "Option 7 Short",
    description: "This is another short description.",
    disabled: false,
  },
];

type Story = StoryObj<typeof Select>;

export const SelectStory: Story = {
  args: {
    options,
  },
};
export const SelectStoryWithTileOverDescription: Story = {
  args: {
    options,
    descriptionUnderTitle: true,
    value: "option6",
  },
};
export const SelectStoryWithEllipsis: Story = {
  args: {
    options,
    descriptionUnderTitle: true,
    value: "option6",
    ellipsis: true,
  },
};

export const SelectStoryWithEllipsisAndWidthConstraint: Story = {
  args: {
    options,
    descriptionUnderTitle: true,
    value: "option6",
    ellipsis: true,
    containToSelectWidth: true,
  },
};

const CustomComponent = (props: SelectOptionsComponentProps) => {
  const { title, value, disabled, description, className, leftImageUrl, selectedItem } = props;

  return (
    <div style={{ border: "5px solid red" }}>
      {title}-{value}
    </div>
  );
};
export const SelectStoryWithCustomComponent: Story = {
  args: {
    options,
    descriptionUnderTitle: true,
    value: "option6",
    ellipsis: true,
    containToSelectWidth: true,
    customOptionsRenderer: CustomComponent,
  },
};

export const SelectWithInputAdornment: Story = {
  args: {
    options,
    descriptionUnderTitle: true,
    value: "option6",
    ellipsis: true,
    containToSelectWidth: true,
    adornment: options.map((x) => <Icon>{IconNames.message}</Icon>),
  },
};

export const SelectWithCustomInputRenderer: Story = {
  args: {
    options,
    descriptionUnderTitle: true,
    value: "option6",
    ellipsis: true,
    containToSelectWidth: true,
    customInputRenderer: (props) => {
      return <div>{props.value} CUSTOM</div>;
    },
  },
};

const sortOptions: SelectOptionProp[] = [
  { key: "favourites", value: "favourites", title: "Favourites first" },
  { key: "newest", value: "newest", title: "Newest first" },
  { key: "nameAsc", value: "nameAsc", title: "Name A-Z" },
];

// The label never runs under the chevron: its right edge stays left of the chevron's
const expectLabelClearOfChevron = (field: HTMLElement, name: string) => {
  const label = field.querySelector<HTMLElement>(".MuiSelect-select")!;
  const chevron = field.querySelector<HTMLElement>(".MuiSelect-icon");
  expect(chevron, `${name}: chevron`).not.toBeNull();
  const labelPaddingRight = parseFloat(getComputedStyle(label).paddingRight);
  const labelContentRight = label.getBoundingClientRect().right - labelPaddingRight;
  expect(labelContentRight, `${name}: label clear of the chevron`).toBeLessThanOrEqual(
    chevron!.getBoundingClientRect().left,
  );
};

// size="small": the compact 32px filled select (12px medium text, 16px chevron 8px from the edge)
export const SelectSmall: Story = {
  args: {
    size: "small",
    labelType: "hidden",
    label: "Sort",
    options: sortOptions,
    value: "favourites",
    translateOptions: false,
  },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
      <Select {...args} testId="select-small" />
      <div style={{ width: 104 }}>
        <Select {...args} testId="select-small-narrow" />
      </div>
      <div style={{ width: 104 }}>
        <Select {...args} size="medium" testId="select-medium-narrow" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [field] = canvas.getAllByTestId("select-small");
    const root = field.querySelector<HTMLElement>(".MuiOutlinedInput-root")!;
    const label = field.querySelector<HTMLElement>(".MuiSelect-select")!;

    await waitFor(() => {
      const chevron = field.querySelector<HTMLElement>(".MuiSelect-icon");
      expect(chevron, "chevron loaded").not.toBeNull();
      expect(root.getBoundingClientRect().height, "height").toBe(32);
      expect(getComputedStyle(root).borderRadius, "radius").toBe("4px");
      expect(getComputedStyle(root.querySelector("fieldset")!).borderTopWidth, "no outline").toBe("0px");
      expect(getComputedStyle(label).fontSize, "font size").toBe("12px");
      expect(getComputedStyle(label).fontWeight, "font weight").toBe("500");
      expect(chevron!.getBoundingClientRect().width, "chevron size").toBe(16);
      expect(root.getBoundingClientRect().right - chevron!.getBoundingClientRect().right, "chevron inset").toBe(8);
    });

    await waitFor(() => {
      expectLabelClearOfChevron(field, "small");
      expectLabelClearOfChevron(canvas.getAllByTestId("select-small-narrow")[0], "small narrow");
      expectLabelClearOfChevron(canvas.getAllByTestId("select-medium-narrow")[0], "medium narrow");
    });
  },
};
