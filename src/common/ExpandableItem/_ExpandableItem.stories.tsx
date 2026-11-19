import { ExpandableItem, ExpandableItemProps } from "./ExpandableItem";
import React from "react";
import { disableControls, SbDecorator } from "@test-utils/get-storybook-decorator";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/ExpandableItem",
  component: ExpandableItem,
  extra: {
    ...disableControls([""]),
  },
}),
};

/**
 * Default props of all the stories
 * If the storybook user did not add anything this will be chosen
 * */
const defaultProps: ExpandableItemProps = {};

export const ExpandableItemStory = (props: ExpandableItemProps) => {
  /**
   * Here we can add story specific props
   * */
  return (
    <div>
      <ExpandableItem {...props}></ExpandableItem>
    </div>
  );
};
