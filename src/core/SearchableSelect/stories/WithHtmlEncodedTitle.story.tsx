import { expect, within } from "storybook/test";

import { SelectOptionProp } from "@vanguard/Select/Select";

import { SearchableSelect } from "../SearchableSelect";
import { Story } from "./_SearchableSelect.default";

const options: SelectOptionProp[] = [
  { key: "amp-test", value: "amp-test", title: "A&amp;P, LLC" },
  { key: "other", value: "other", title: "Other Option" },
];

export const WithHtmlEncodedTitle: Story = {
  render: () => <SearchableSelect options={options} value={"amp-test"} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("A&P, LLC")).toBeInTheDocument();
  },
};
