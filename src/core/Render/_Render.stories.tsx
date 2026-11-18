import { SbDecorator } from "@test-utils/get-storybook-decorator";
import React from "react";
import { Render, RenderProps } from "@vanguard/Render/Render";
import { Text } from "@vanguard/Text/Text";

export default {
  ...SbDecorator({
  title: "Vanguard/Render",
  component: Render,
  extra: {
    argTypes: {
      if: {
        defaultValue: true,
      },
    },
  },
}),
};

export const RenderStory = (props: RenderProps) => {
  return (
    <div style={{ width: "100%" }}>
      <Text>Text before</Text>
      <Render {...props}>
        <Text>I will render based on condition</Text>
      </Render>
      <Text>Text after</Text>
    </div>
  );
};
