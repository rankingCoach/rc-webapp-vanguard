
import { FooterShowLess, FooterShowLessProps } from "./FooterShowLess";
import React from "react";
import {disableControls, SbDecorator} from "@test-utils/get-storybook-decorator";
import {mapStorybookActionToProps} from "@test-utils/map-storybook-action-to-props";

export default {
  ...SbDecorator({
  title: "Vanguard/Table/TableFooter/FooterShowLess",
  component: FooterShowLess,
    extra: {
    ...disableControls([""]),
  },
}),
};

/**
 * Default props of all the stories 
 * If the storybook user did not add anything this will be chosen 
 * */
const defaultProps: FooterShowLessProps = {
 
};


export const FooterShowLessStory = (props:FooterShowLessProps) => {
  
  /**
  * Here we can add story specific props
  * */
  const propsMock = mapStorybookActionToProps(props, {
    ...defaultProps,
  });

  return (
    <div >
        <FooterShowLess {...propsMock}>ImplementME</FooterShowLess>
    </div>
  );
};

