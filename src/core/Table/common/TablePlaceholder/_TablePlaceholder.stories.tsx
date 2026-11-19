
import { TablePlaceholder, TablePlaceholderProps } from "./TablePlaceholder";
import React from "react";
import {disableControls, SbDecorator} from "@test-utils/get-storybook-decorator";
import {mapStorybookActionToProps} from "@test-utils/map-storybook-action-to-props";

export default {
  ...SbDecorator({
  title: "Vanguard/Table/common/TablePlaceholder",
  component: TablePlaceholder,
    extra: {
    ...disableControls([""]),
  },
}),
};

/**
 * Default props of all the stories 
 * If the storybook user did not add anything this will be chosen 
 * */
const defaultProps: TablePlaceholderProps = {
 
};


export const TablePlaceholderStory = (props:TablePlaceholderProps) => {
  
  /**
  * Here we can add story specific props
  * */
  const propsMock = mapStorybookActionToProps(props, {
    ...defaultProps,
  });

  return (
    <div >
        <TablePlaceholder {...propsMock}>ImplementME</TablePlaceholder>
    </div>
  );
};

