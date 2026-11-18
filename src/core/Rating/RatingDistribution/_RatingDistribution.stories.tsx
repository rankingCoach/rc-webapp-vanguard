import { RatingDistribution, RatingDistributionProps } from "./RatingDistribution";
import React from "react";
import { disableControls, SbDecorator } from "@test-utils/get-storybook-decorator";
import { mapStorybookActionToProps } from "@test-utils/map-storybook-action-to-props";

export default {
  ...SbDecorator({
  title: "Vanguard/Rating/RatingDistribution",
  component: RatingDistribution,
  extra: {
    ...disableControls([""]),
    // Storybook 7+ ignores argTypes.defaultValue; the same defaults as meta args so the story renders.
    args: {
      ratingDistributionData: [
        { ratingsNumber: 46, starsNumber: 5, color: "var(--s400)" },
        { ratingsNumber: 24, starsNumber: 4, color: "var(--w400)" },
        { ratingsNumber: 10, starsNumber: 3, color: "var(--e500)" },
        { ratingsNumber: 10, starsNumber: 2, color: "var(--e500)" },
        { ratingsNumber: 2, starsNumber: 1, color: "var(--e500)" },
      ],
      showTotalNumberOfRatings: true,
      title: "Rating distribution",
    },
    argTypes: {
      ratingDistributionData: {
        defaultValue: [
          {
            ratingsNumber: 46,
            starsNumber: 5,
            color: "var(--s400)",
          },
          {
            ratingsNumber: 24,
            starsNumber: 4,
            color: "var(--w400)",
          },
          {
            ratingsNumber: 10,
            starsNumber: 3,
            color: "var(--e500)",
          },
          {
            ratingsNumber: 10,
            starsNumber: 2,
            color: "var(--e500)",
          },
          {
            ratingsNumber: 2,
            starsNumber: 1,
            color: "var(--e500)",
          },
        ],
      },
      showTotalNumberOfRatings: {
        defaultValue: true,
      },
      title: {
        defaultValue: "Rating distribution",
      },
    },
  },
}),
};

/**
 * Default props of all the stories
 * If the storybook user did not add anything this will be chosen
 * */
const defaultProps: any = {};

export const RatingDistributionStory = (props: RatingDistributionProps) => {
  /**
   * Here we can add story specific props
   * */
  const propsMock = mapStorybookActionToProps(props, {
    ...defaultProps,
  });

  return (
    <div>
      <RatingDistribution {...propsMock}>ImplementME</RatingDistribution>
    </div>
  );
};
