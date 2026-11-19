import { InfoText, InfoTextProps } from "./InfoText";
import React from "react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/InfoText",
  component: InfoText,
}),
};

export const InfoTextStory = (props: InfoTextProps) => {
  return (
    <div>
      <InfoText title={"Learn more about responsive ads"} />
    </div>
  );
};
