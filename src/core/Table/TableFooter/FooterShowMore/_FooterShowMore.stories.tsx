
import { FooterShowMore, FooterShowMoreProps } from "./FooterShowMore";
import React from "react";
import {disableControls, SbDecorator} from "@test-utils/get-storybook-decorator";
import {mapStorybookActionToProps} from "@test-utils/map-storybook-action-to-props";

export default {
  ...SbDecorator({
  title: "Vanguard/Table/TableFooter/FooterShowMore",
  component: FooterShowMore,
    extra: {
    ...disableControls([""]),
  },
}),
};

/**
 * Default props of all the stories 
 * If the storybook user did not add anything this will be chosen 
 * */
const defaultProps: FooterShowMoreProps = {
 
};


export const FooterShowMoreStory = (props:FooterShowMoreProps) => {
  
  /**
  * Here we can add story specific props
  * */
  const propsMock = mapStorybookActionToProps(props, {
    ...defaultProps,
  });

  return (
    <div >
        <FooterShowMore {...propsMock}>ImplementME</FooterShowMore>
    </div>
  );
};

