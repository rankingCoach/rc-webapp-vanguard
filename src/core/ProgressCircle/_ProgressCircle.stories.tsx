import React from "react";
import { expect } from "storybook/test";
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
// `size` and `progress` are required props: without args the story rendered NaN geometry (track (h)).
ProgressCircleStory.args = { size: 80, progress: 65 } satisfies ProgressCircleProps;
ProgressCircleStory.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const geometry = [...canvasElement.querySelectorAll('svg, circle')].flatMap((el) =>
    ['width', 'height', 'r', 'cx', 'cy', 'stroke-width'].map((a) => el.getAttribute(a)).filter((v) => v !== null),
  );
  await expect(geometry.length).toBeGreaterThan(0);
  await expect(geometry.filter((v) => !Number.isFinite(Number(v)))).toEqual([]);
};
