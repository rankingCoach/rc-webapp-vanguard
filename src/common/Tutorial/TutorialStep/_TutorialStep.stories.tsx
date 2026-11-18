import { TutorialStep, TutorialStepProps } from "./TutorialStep";
import React from "react";
import { disableControls, SbDecorator } from "@test-utils/get-storybook-decorator";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/Tutorial/TutorialStep",
  component: TutorialStep,
  extra: {
    ...disableControls([""]),
  },
}),
};

/**
 * Default props of all the stories
 * If the storybook user did not add anything this will be chosen
 * */
const defaultProps: TutorialStepProps = {
  title: "",
  description: "",
};

export const TutorialStepStory = (props: TutorialStepProps) => {
  /**
   * Here we can add story specific props
   * */

  return (
    <div>
      <TutorialStep {...props}>ImplementME</TutorialStep>
    </div>
  );
};
