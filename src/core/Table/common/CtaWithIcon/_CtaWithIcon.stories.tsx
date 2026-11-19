
import { CtaWithIcon, CtaWithIconProps } from "./CtaWithIcon";
import React from "react";
import {disableControls, SbDecorator} from "@test-utils/get-storybook-decorator";
import {mapStorybookActionToProps} from "@test-utils/map-storybook-action-to-props";

export default {
  ...SbDecorator({
  title: "Vanguard/Table/common/CtaWithIcon",
  component: CtaWithIcon,
    extra: {
    ...disableControls([""]),
  },
}),
};

/**
 * Default props of all the stories 
 * If the storybook user did not add anything this will be chosen 
 * */
const defaultProps: CtaWithIconProps = {
 
};


export const CtaWithIconStory = (props:CtaWithIconProps) => {
  
  /**
  * Here we can add story specific props
  * */
  const propsMock = mapStorybookActionToProps(props, {
    ...defaultProps,
  });

  return (
    <div >
        <CtaWithIcon {...propsMock}>ImplementME</CtaWithIcon>
    </div>
  );
};

