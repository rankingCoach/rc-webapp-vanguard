import React from "react";
import { OpeningTimesItem, OpeningTimesItemProps } from "./OpeningTimesItem";
import { SbDecorator } from "@test-utils/get-storybook-decorator";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/OpeningTimes/OpeningTimesItem",
  component: OpeningTimesItem,
}),
};

export const OpeningTimesItemStory = (props: OpeningTimesItemProps) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <OpeningTimesItem {...props} />
    </div>
  );
};
