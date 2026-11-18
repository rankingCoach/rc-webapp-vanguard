import { FeatureBox, type FeatureBoxProps } from "./FeatureBox";
import React from "react";
import { disableControls, SbDecorator } from "@test-utils/get-storybook-decorator";
import { IconNames } from "@vanguard/Icon/IconNames";
// @ts-ignore
import animation from "../../../vanguard/LottieAnimationLoader/LottieBase/mock/mock-anim.json";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/FeatureBox",
  component: FeatureBox,
  extra: {
    ...disableControls([""]),
  },
}),
};

const items = [
  {
    content: "Brand insights feed. Know everything happening online that affects your business",
    iconName: IconNames.arrowLeft,
    iconColor: "var(--s100)",
    iconBackgroundColor: "var(--s500)",
  },
  {
    content: "Competitor tracking. Monitor your competitors’ online activity",
    iconName: IconNames.arrowLeft,
    iconColor: "var(--s100)",
    iconBackgroundColor: "var(--s500)",
  },
  {
    content: "Email alerts. Be notified immediately with mentions & reviews",
    iconName: IconNames.arrowLeft,
    iconColor: "var(--s100)",
    iconBackgroundColor: "var(--s500)",
  },
];

/**
 * Default props of all the stories
 * If the storybook user did not add anything this will be chosen
 * */
const defaultProps: FeatureBoxProps = {
  title: "Brand Monitoring. Protect your business",
  subtitle: "rankingCoach scans the internet and alerts you when it finds references to your business and brand.",
  featuresList: items,
  animation: animation,
  onClick: () => {},
};

export const FeatureBoxStory = (props: FeatureBoxProps) => {
  /**
   * Here we can add story specific props
   * */
  return (
    <div style={{ padding: 70 }}>
      <FeatureBox {...props}></FeatureBox>
    </div>
  );
};
