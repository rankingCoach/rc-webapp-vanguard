import { StatisticsBoardItem, StatisticsBoardItemProps } from "./StatisticsBoardItem";
import React from "react";
import { disableControls, SbDecorator, SbJumpPageBackground } from "@test-utils/get-storybook-decorator";
import { IconNames } from "@vanguard/Icon/IconNames";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/StatisticsBoard/StatisticsBoardItem",
  component: StatisticsBoardItem,
  extra: {
    argTypes: {
      ...disableControls,
    },
  },
}),
};

export const StatisticsBoardItemStory = (props: StatisticsBoardItemProps) => {
  return (
    <SbJumpPageBackground>
      <div style={{ width: "300px" }}>
        <StatisticsBoardItem
          iconName={IconNames.bank}
          total={10}
          title={"Hello World"}
          description={"This is a description"}
          linkText={"See more"}
          cardOnClick={"www.google.com"}
          ctaText={"Say Hello"}
          ctaOnClick={() => {
            alert("Hello!");
          }}
        />
      </div>
    </SbJumpPageBackground>
  );
};

export const StatisticsBoardItemEmptyStory = (props: StatisticsBoardItemProps) => {
  return (
    <SbJumpPageBackground>
      <div style={{ width: "300px" }}>
        <StatisticsBoardItem
          iconName={IconNames.mail}
          empty={true}
          title={"Hello World"}
          description={"This is a description"}
          cardOnClick={"www.google.com"}
          ctaText={"Say Hello"}
          ctaOnClick={() => {
            alert("Hello!");
          }}
        />
      </div>
    </SbJumpPageBackground>
  );
};
