import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { Button, ButtonProps, ButtonSizes, ButtonTypes } from "@vanguard/Button/Button";
import { IconNames } from "@vanguard/Icon/IconNames";
import React from "react";
import { classNames } from "@helpers/classNames";
import { dFlex, dFlexColumn, gap1, gap2 } from "@globalStyles";
import { Label } from "@vanguard/Label/Label";
import { ButtonsDemoRendering, ButtonStory } from "./stories/_Button.default";

export default {
  ...SbDecorator({
    title: "Vanguard/Button",
    component: Button,
    opts: {
      hideAllControls: true,
    },
  }),
};
export const ButtonDemoPrimary: ButtonStory = {
  render: ButtonsDemoRendering,
};

export const ButtonDemoDefault: ButtonStory = {
  args: {
    type: ButtonTypes.default,
  },
  render: ButtonsDemoRendering,
};

export const ButtonDemoSecondary: ButtonStory = {
  args: {
    type: ButtonTypes.secondary,
  },
  render: ButtonsDemoRendering,
};

export const ButtonDemoMuted: ButtonStory = {
  args: {
    type: ButtonTypes.muted,
  },
  render: ButtonsDemoRendering,
};

export const ButtonDemoMutedInverted: ButtonStory = {
  args: {
    type: ButtonTypes.muted,
    inverted: true,
  },
  render: ButtonsDemoRendering,
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
};

export const ButtonDemoShimmer: ButtonStory = {
  args: {
    type: ButtonTypes.shimmer,
  },
  render: ButtonsDemoRendering,
};

export const ButtonDemoPrimaryRound: ButtonStory = {
  args: {
    type: ButtonTypes.primary,
    shape: "round",
  },
  render: ButtonsDemoRendering,
};

export const ButtonDemoMutedRound: ButtonStory = {
  args: {
    type: ButtonTypes.muted,
    shape: "round",
  },
  render: ButtonsDemoRendering,
};

export const ButtonAI: ButtonStory = {
  args: {
    type: ButtonTypes.shimmer,
    children: "Generate AI Images",
    iconLeft: IconNames.ai,
  },
  render: (args: ButtonProps) => {
    return (
      <div className={classNames(dFlexColumn, gap2)}>
        <div>
          <Label value="Small" />
          <div className={classNames(dFlex, gap1)}>
            <Button {...args} size={ButtonSizes.small} />
            <Button {...args} size={ButtonSizes.small} disabled={true} />
          </div>
        </div>

        <div>
          <Label value="Default" />
          <div className={classNames(dFlex, gap1)}>
            <Button {...args} />
            <Button {...args} disabled={true} />
          </div>
        </div>

        <div>
          <Label value="Large" />
          <div className={classNames(dFlex, gap1)}>
            <Button {...args} size={ButtonSizes.large} />
            <Button {...args} size={ButtonSizes.large} disabled={true} />
          </div>
        </div>
      </div>
    );
  },
};
