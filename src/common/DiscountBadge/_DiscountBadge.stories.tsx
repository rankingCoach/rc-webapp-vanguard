import { DiscountBadge, type DiscountBadgeProps } from "./DiscountBadge";
import React from "react";
import { disableControls, SbDecorator } from "@test-utils/get-storybook-decorator";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/DiscountBadge",
  component: DiscountBadge,
  extra: {
    ...disableControls([""]),
  },
}),
};

/**
 * Default props of all the stories
 * If the storybook user did not add anything this will be chosen
 * */
const defaultProps: DiscountBadgeProps = {
  percentValue: 37,
  resellerName: "direct-channel",
};

export const DiscountBadgeStory = (props: DiscountBadgeProps) => {
  /**
   * Here we can add story specific props
   * */
  return <DiscountBadge {...props}>ImplementME</DiscountBadge>;
};
