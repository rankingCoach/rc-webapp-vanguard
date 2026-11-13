import React, { useState } from "react";
import { ToggleButtonGroup } from "../ToggleButtonGroup";
import { ToggleButton } from "@vanguard/ToggleButton/ToggleButton";
import { within, expect, userEvent, waitFor } from "storybook/test";
import { Icon } from "@vanguard/Icon/Icon";
import { IconNames } from "@vanguard/Icon/IconNames";
import { Story } from "./_ToggleButtonGroup.default";

const SOURCES = ["My Library", "Stock", "Logos"];

// variant="segmented": a 32px muted track, the pressed item a white chip; text items and icon-only items.
// `rounded` makes the track and items pills, `segmentedSize="large"` a 48px track with 16px labels.
export const Segmented: Story = {
  render: () => {
    const [source, setSource] = useState("My Library");
    const [view, setView] = useState("grid");

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <ToggleButtonGroup
          variant="segmented"
          exclusive
          aria-label="Source"
          value={source}
          onChange={(_e, value) => value && setSource(value)}
          data-testid="segmented-sources"
        >
          {SOURCES.map((label) => (
            <ToggleButton key={label} value={label}>
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <ToggleButtonGroup
          variant="segmented"
          exclusive
          aria-label="View"
          value={view}
          onChange={(_e, value) => value && setView(value)}
          data-testid="segmented-views"
        >
          <ToggleButton value="grid" aria-label="Grid view">
            <Icon>{IconNames.image}</Icon>
          </ToggleButton>
          <ToggleButton value="list" aria-label="List view">
            <Icon>{IconNames.bulletList}</Icon>
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          variant="segmented"
          rounded
          segmentedSize="large"
          exclusive
          aria-label="Source, as a page's main switch"
          value={source}
          onChange={(_e, value) => value && setSource(value)}
          data-testid="segmented-rounded-large"
        >
          {SOURCES.map((label) => (
            <ToggleButton key={label} value={label}>
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <ToggleButtonGroup variant="segmented" exclusive value="a" data-testid="segmented-disabled">
          <ToggleButton value="a">Enabled</ToggleButton>
          <ToggleButton value="b" disabled>
            Disabled
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sources = canvas.getByTestId("segmented-sources");
    const library = within(sources).getByRole("button", { name: "My Library" });
    const stock = within(sources).getByRole("button", { name: "Stock" });

    await waitFor(() => {
      expect(sources.getBoundingClientRect().height, "track height").toBe(32);
      expect(library.getBoundingClientRect().height, "item height").toBe(28);
      expect(getComputedStyle(library).textTransform, "keeps its case").toBe("none");
      expect(getComputedStyle(library).fontSize, "font size").toBe("12px");
      expect(getComputedStyle(library).fontWeight, "font weight").toBe("500");
      expect(getComputedStyle(library).borderRadius, "item radius").toBe("4px");
      expect(getComputedStyle(sources).borderRadius, "track radius").toBe("6px");
    });

    // rounded + large: a 48px pill track with 44px pill items and 16px labels
    const pill = canvas.getByTestId("segmented-rounded-large");
    const pillItem = within(pill).getByRole("button", { name: "My Library" });
    await waitFor(() => {
      expect(pill.getBoundingClientRect().height, "large track height").toBe(48);
      expect(pillItem.getBoundingClientRect().height, "large item height").toBe(44);
      expect(getComputedStyle(pillItem).fontSize, "large font size").toBe("16px");
      expect(getComputedStyle(pillItem).borderRadius, "pill item").toBe("999px");
      expect(getComputedStyle(pill).borderRadius, "pill track").toBe("999px");
    });

    // pressed: the white chip; the others transparent on the track
    await expect(library).toHaveAttribute("aria-pressed", "true");
    await expect(stock).toHaveAttribute("aria-pressed", "false");
    expect(getComputedStyle(library).backgroundColor, "pressed chip").not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(stock).backgroundColor, "unpressed").toBe("rgba(0, 0, 0, 0)");

    // keyboard: Tab to the next segment, Space presses it
    library.focus();
    await userEvent.tab();
    await expect(stock).toHaveFocus();
    await userEvent.keyboard(" ");
    await waitFor(() => expect(stock).toHaveAttribute("aria-pressed", "true"));
    await expect(library).toHaveAttribute("aria-pressed", "false");

    // icon-only items are 28px squares
    const views = canvas.getByTestId("segmented-views");
    const grid = within(views).getByRole("button", { name: "Grid view" });
    await waitFor(() => {
      expect(grid.querySelector("svg"), "icon loaded").not.toBeNull();
      expect(grid.getBoundingClientRect().width, "icon item width").toBe(28);
      expect(grid.getBoundingClientRect().height, "icon item height").toBe(28);
      expect(views.getBoundingClientRect().height, "icon track height").toBe(32);
    });

    // icons are painted in the item's text colour
    const gridPath = grid.querySelector("svg path")!;
    expect(getComputedStyle(gridPath).fill, "icon colour").toBe(getComputedStyle(grid).color);

    const disabled = within(canvas.getByTestId("segmented-disabled")).getByRole("button", { name: "Disabled" });
    expect(getComputedStyle(disabled).opacity, "disabled").toBe("0.4");
  },
};
