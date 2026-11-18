import React from "react";
import { disableControls, SbDecorator } from "@test-utils/get-storybook-decorator";
import { IncentiveBox, type IncentiveBoxProps } from "@common/IncentiveBox/IncentiveBox";
import { IconNames } from "@vanguard/Icon/IconNames";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/IncentiveBox",
  component: IncentiveBox,
  extra: {
    argTypes: {
      ...disableControls(["onClickBtn"]),
      text: {
        defaultValue:
          "Get a complete overview and remove the hassle of checking multiple sources by connecting your Google Analytics account.",
      },
      icon: {
        defaultValue: IconNames.help,
      },
      hasButton: {
        defaultValue: true,
      },
      buttonText: {
        defaultValue: "Connect now",
      },
    },
  },
}),
};

export const IncentiveBoxStory = (props: IncentiveBoxProps) => {
  return (
    <div>
      <IncentiveBox {...props} />
    </div>
  );
};
