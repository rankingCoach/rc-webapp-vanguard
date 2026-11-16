import React, { useRef, useState } from "react";
import { AIAssistant } from "../AIAssistant";
import { Textarea } from "@vanguard/Textarea/Textarea";
import { within, expect } from "storybook/test";
import { Story, createMockGenerateCallback, createMockAdjustCallback, Container } from "./_AIAssistant.default";

export const Disabled: Story = {
  args: {
    anchorElem: null,
    generateCallback: createMockGenerateCallback(),
    adjustCallback: createMockAdjustCallback(),
    value: "",
    setValue: () => {},
    disabled: true,
  },
  render: (args) => {
    const [text, setText] = useState("");
    const anchorRef = useRef<HTMLDivElement>(null);

    return (
      <Container>
        <div ref={anchorRef}>
          <AIAssistant
            {...args}
            anchorElem={anchorRef.current}
            value={text}
            setValue={setText}
          >
            <Textarea
              value={text}
              counter={false}
              onChange={(e) => setText(e.target.value)}
            />
          </AIAssistant>
        </div>
      </Container>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const generateButton = canvas.getByRole("button", { name: /generate/i });
    await expect(generateButton).toBeDisabled();
  },
};