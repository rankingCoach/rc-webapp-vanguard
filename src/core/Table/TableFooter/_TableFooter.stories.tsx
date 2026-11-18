
import { TableFooter, TableFooterProps } from "./TableFooter";
import React from "react";
import {disableControls, SbDecorator} from "@test-utils/get-storybook-decorator";
import {mapStorybookActionToProps} from "@test-utils/map-storybook-action-to-props";

export default {
  ...SbDecorator({
  title: "Vanguard/Table/TableFooter",
  component: TableFooter,
    extra: {
    ...disableControls([""]),
  },
}),
};

/**
 * Default props of all the stories 
 * If the storybook user did not add anything this will be chosen 
 * */
const defaultProps: TableFooterProps = {
 
};


export const TableFooterStory = (props:TableFooterProps) => {
  
  /**
  * Here we can add story specific props
  * */
  const propsMock = mapStorybookActionToProps(props, {
    ...defaultProps,
  });

  return (
    <table >
        <TableFooter {...propsMock}>ImplementME</TableFooter>
    </table>
  );
};

