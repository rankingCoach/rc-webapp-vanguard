import React, { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { wait } from "@helpers/wait";
import { Textarea } from "@vanguard/Textarea/Textarea";
import { Story } from "./_Textarea.default";

// Simulates the app's AI-generation flow: isLoading goes true -> false (skeleton
// mounts and unmounts), then the user pastes/types a link. The skeleton must not
// steal the backdrop ref, otherwise highlights die after one loading cycle.
const LoadingCycleDemo = () => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setIsLoading((v) => !v)}>
        Toggle loading
      </button>
      <Textarea
        highlightUrl={true}
        highlightUrlType="info"
        allowBreakLines={true}
        value="Post text before AI generation"
        valueAsDefaultValue={true}
        isLoading={isLoading}
      />
    </div>
  );
};

export const TextareaHighlightUrlsLoadingCycleSync: Story = {
  render: () => <LoadingCycleDemo />,
  play: async ({ canvasElement }) => {
    await wait(100);
    const toggle = within(canvasElement).getByText("Toggle loading");

    // Full loading cycle: skeleton mounts, then unmounts
    await userEvent.click(toggle);
    await wait(150);
    await userEvent.click(toggle);
    await wait(150);

    const textarea = canvasElement.querySelector("textarea");
    const backdrop = canvasElement.querySelector(".vanguard-input-backdrop") as HTMLElement;
    if (!textarea || !backdrop) throw new Error("Textarea or backdrop not found");

    await userEvent.type(textarea, " http://test-after-ai.com", { delay: 1 });
    await wait(200);

    // Highlighting must survive the loading cycle
    const mark = canvasElement.querySelector(".vanguard-input-mark-blue");
    await expect(mark).not.toBeNull();
    await expect(mark?.textContent).toBe("http://test-after-ai.com");
    await expect(backdrop.getBoundingClientRect().height).toBeCloseTo(textarea.getBoundingClientRect().height, 0);
  },
};
