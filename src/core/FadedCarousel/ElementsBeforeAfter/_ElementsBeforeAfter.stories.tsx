import { ElementsBeforeAfter, ElementsBeforeAfterProps } from "./ElementsBeforeAfter";
import React from "react";
import { disableControls, SbDecorator } from "@test-utils/get-storybook-decorator";
import { mapStorybookActionToProps } from "@test-utils/map-storybook-action-to-props";
import { Text } from "@vanguard/Text/Text";

export default {
  ...SbDecorator({
  title: "Vanguard/FadedCarousel/ElementsBeforeAfter",
  component: ElementsBeforeAfter,
  extra: {
    ...disableControls([""]),
  },
}),
};

/**
 * Default props of all the stories
 * If the storybook user did not add anything this will be chosen
 * */
const defaultProps: ElementsBeforeAfterProps = {
  children: [],
};

export const ElementsBeforeAfterStory = (props: ElementsBeforeAfterProps) => {
  /**
   * Here we can add story specific props
   * */
  const propsMock = mapStorybookActionToProps(props, {
    ...defaultProps,
  });

  return (
    <div>
      <ElementsBeforeAfter {...propsMock}>
        {[
          <Text key={1}>1</Text>,
          <Text key={2}>2</Text>,
          <Text key={3}>3</Text>,
          <Text key={4}>4</Text>,
          <Text key={5}>5</Text>,
          <Text key={6}>6</Text>,
        ]}
      </ElementsBeforeAfter>
    </div>
  );
};
