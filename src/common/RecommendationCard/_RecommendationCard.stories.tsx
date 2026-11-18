import { RecommendationCard, RecommendationCardProps } from "./RecommendationCard";
import React from "react";
import { disableControls, SbDecorator } from "@test-utils/get-storybook-decorator";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/RecommendationCard",
  component: RecommendationCard,
  extra: {
    ...disableControls([""]),
  },
}),
};

/**
 * Default props of all the stories
 * If the storybook user did not add anything this will be chosen
 * */
const defaultProps: RecommendationCardProps = {
  title: "Title",
  description: "Description",
};

export const RecommendationCardStory = (props: RecommendationCardProps) => {
  /**
   * Here we can add story specific props
   * */
  return (
    <div>
      <RecommendationCard {...props}>ImplementME</RecommendationCard>
    </div>
  );
};
