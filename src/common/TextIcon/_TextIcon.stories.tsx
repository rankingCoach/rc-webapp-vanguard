import { TextIcon } from "./TextIcon";
import { IconNames } from "@vanguard/Icon/IconNames";
import { SbDecorator } from "@test-utils/get-storybook-decorator";
import React from "react";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/TextIcon",
  component: TextIcon,
}),
};
export const Primary = () => {
  return (
    <div>
      <TextIcon icon={IconNames.add}>TEST</TextIcon>
    </div>
  );
};

export const NoChildren = () => {
  return (
    <div>
      <TextIcon icon={IconNames.add} />
    </div>
  );
};

export const WithIconColor = () => {
  return (
    <div>
      <TextIcon iconColor={"--e500"} icon={IconNames.add} />
    </div>
  );
};
