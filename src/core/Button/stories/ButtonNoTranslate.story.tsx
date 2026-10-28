import React from "react";
import { rcWindow } from "@stores/window.store";
import { Button, ButtonTypes } from "../Button";
import { within, expect, fn } from "storybook/test";
import { ButtonStory } from "./_Button.default";

const LABEL = "Brand {name}";
let previousTranslations: Record<string, string> | undefined;

// Tests that the label is rendered as-is (no translation) when translate={false}, while replacements still apply
export const ButtonNoTranslate: ButtonStory = {
  beforeEach: () => {
    previousTranslations = rcWindow["TranslationsData"];
    rcWindow["TranslationsData"] = { ...previousTranslations, [LABEL]: "Marke {name}" };
  },
  afterEach: () => {
    rcWindow["TranslationsData"] = previousTranslations;
  },
  args: {
    type: ButtonTypes.primary,
    children: LABEL,
    replacements: { name: "rankingCoach" },
    translate: false,
    testId: "button-no-translate",
    onClick: fn(),
  },
  render: (props) => (
    <div style={{ display: "flex", gap: "16px" }}>
      <Button {...props} />
      <Button {...props} testId="button-translated" translate={undefined} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = (testId: string) => canvas.getByTestId(`${testId}_button`);
    const label = (testId: string) => button(testId).querySelector(".rc-text") as HTMLElement;

    // The untranslated label keeps its original text, with replacements applied
    await expect(button("button-no-translate")).toHaveTextContent("Brand rankingCoach");
    await expect(label("button-no-translate")).toHaveClass("notranslate");

    // By default the label is translated
    await expect(button("button-translated")).toHaveTextContent("Marke rankingCoach");
    await expect(label("button-translated")).not.toHaveClass("notranslate");
  },
};
