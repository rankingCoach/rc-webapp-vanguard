import { StatisticsBoard, type StatisticsBoardProps } from "./StatisticsBoard";
import React from "react";
import { disableControls, SbDecorator, SbJumpPageBackground } from "@test-utils/get-storybook-decorator";
import { IconNames } from "@vanguard/Icon/IconNames";
import { FrostedGlass } from "@vanguard/FrostedGlass/FrostedGlass";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/StatisticsBoard",
  component: StatisticsBoard,
  extra: {
    argTypes: {
      ...disableControls,
      items: {
        defaultValue: [
          {
            total: 48,
            title: "Posts",
            description: "Keep your customers up to date with news",
            disabled: true,
            iconName: IconNames.browser,
            linkText: "See posts",
            ctaText: "Add a post",
          },
          {
            total: 24,
            title: "Events",
            description: "Create events for your customers",
            disabled: false,
            iconName: IconNames.calendar,
            linkText: "See events",
            ctaText: "Create an event",
          },
          {
            total: 24,
            title: "Chat",
            description: "Chat with your friends",
            disabled: false,
            iconName: IconNames.mail,
            iconFillColor: "--e500",
            linkText: "See chats",
            ctaText: "Start a conversation",
          },
          {
            iconName: IconNames.bank,
            empty: true,
            title: "Products",
            description: "Promote your latest products",
            ctaText: "Add a product",
          },
        ],
      },
    },
  },
}),
};

export const StatisticsBoardStory = (props: StatisticsBoardProps) => {
  return (
    <SbJumpPageBackground style={{ height: "100%" }}>
      <FrostedGlass style={{ padding: "0 60px" }}>
        <StatisticsBoard {...props} />
      </FrostedGlass>
    </SbJumpPageBackground>
  );
};
