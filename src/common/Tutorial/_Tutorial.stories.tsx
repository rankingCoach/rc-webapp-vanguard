import { Tutorial, TutorialProps } from "./Tutorial";
import React from "react";
import { disableControls, SbDecorator } from "@test-utils/get-storybook-decorator";
import { TutorialStep } from "@common/Tutorial/TutorialStep/TutorialStep";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/Tutorial",
  component: Tutorial,
  extra: {
    ...disableControls([""]),
  },
}),
};

/**
 * Default props of all the stories
 * If the storybook user did not add anything this will be chosen
 * */
const steps = [
  {
    name: "step1",
    component: <TutorialStep title={"Title1"} description={"description2"} />,
    footerOptions: {
      positive: {
        text: "Next",
        cta: () => {
          // function to be executed when positive CTA is clicked
        },
      },
      negative: {
        text: "Skip",
        cta: () => {
          // function to be executed when negative CTA is clicked
        },
      },
    },
  },
  {
    name: "step2",
    component: <TutorialStep title={"Title2"} description={"description2"} />,
    footerOptions: {
      positive: {
        text: "Finish",
        cta: () => {
          // function to be executed when positive CTA is clicked
        },
      },
      negative: {
        text: "Back",
        cta: () => {
          // function to be executed when negative CTA is clicked
        },
      },
    },
  },
];

// @ts-ignore
const defaultProps: TutorialProps = {
  steps: steps,
};

export const TutorialStory = (props: TutorialProps) => {
  /**
   * Here we can add story specific props
   * */

  return (
    <div>
      <Tutorial {...props}>ImplementME</Tutorial>
    </div>
  );
};
