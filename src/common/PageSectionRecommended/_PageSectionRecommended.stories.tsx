import { PageSectionRecommended, type RecommendationCardProps } from "./PageSectionRecommended";
import React from "react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/PageSectionRecommended",
  component: PageSectionRecommended,

  extra: {
    argTypes: {
      hasBadge: {
        defaultValue: true,
      },
      buttonText: {
        defaultValue: "Find out how you can get listed",
      },
      title: {
        defaultValue: [
          "You're not listed in 19 directories.",
          "Publish your business now in all directories with one click.",
        ],
      },
      description: {
        defaultValue:
          "Upgrade to rankingCoach 360, and with just a few clicks, you can now automatically add your business to up to 25 top directories or take over existing entries.",
      },
    },
  },
}),
};

export const RecommendationCardStory = (props: RecommendationCardProps) => {
  return (
    <div style={{ padding: 100 }}>
      <PageSectionRecommended {...props} />
    </div>
  );
};
