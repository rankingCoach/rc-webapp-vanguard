import { RecommendationBadge, type RecommendationBadgeProps } from "./RecommendationBadge";
import React from "react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/PageSectionRecommended/RecommendationBadge",
  component: RecommendationBadge,
}),
};

export const RecommendationBadgeStory = (props: RecommendationBadgeProps) => {
  return (
    <div style={{ padding: 100, position: "relative" }}>
      <RecommendationBadge {...props} />
    </div>
  );
};
