import React from "react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { ProgressCircle, ProgressCircleProps } from "@vanguard/ProgressCircle/ProgressCircle";

export default {
  ...SbDecorator({
  title: "Vanguard/ProgressCircle",
  component: ProgressCircle,
}),
};

export const ProgressCircleStory = (props: ProgressCircleProps) => {
  return (
    <div>
      <ProgressCircle {...props} />
    </div>
  );
};
