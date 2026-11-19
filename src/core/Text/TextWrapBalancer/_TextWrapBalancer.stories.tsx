import { TextWrapBalancer, TextWrapBalancerProps } from "./TextWrapBalancer";
import React from "react";
import { disableControls, SbDecorator } from "@test-utils/get-storybook-decorator";
import { mapStorybookActionToProps } from "@test-utils/map-storybook-action-to-props";

export default {
  ...SbDecorator({
  title: "Vanguard/Text/TextWrapBalancer",
  component: TextWrapBalancer,
  extra: {
    ...disableControls([""]),
  },
}),
};

/**
 * Default props of all the stories
 * If the storybook user did not add anything this will be chosen
 * */
const defaultProps: TextWrapBalancerProps = {
  balanced: false,
  children: "",
};

export const TextWrapBalancerStory = (props: TextWrapBalancerProps) => {
  /**
   * Here we can add story specific props
   * */
  const propsMock = mapStorybookActionToProps(props, {
    ...defaultProps,
  });

  return (
    <div>
      <TextWrapBalancer {...propsMock}>ImplementME</TextWrapBalancer>
    </div>
  );
};
