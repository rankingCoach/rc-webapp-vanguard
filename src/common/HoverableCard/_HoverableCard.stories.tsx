import { HoverableCard, type HoverableCardProps } from "./HoverableCard";
import React from "react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { Text } from "@vanguard/Text/Text";


export default {
  ...SbDecorator({
  title: "BuildingBlocks/HoverableCard",
  component: HoverableCard,
}),
};

export const HoverableCardStory = (props: HoverableCardProps) => {
  const {
    title = "Descriptions",
    subtitles = ["3 added"],
    children = <Text>This is a text children</Text>,
    onClick = () => {
      alert("CLICK");
    }
  } = props;
  return (
    <div >
      <HoverableCard {...props} title={title} subtitles={subtitles} onClick={onClick}>
        {children}
      </HoverableCard>
    </div>
  );
};

