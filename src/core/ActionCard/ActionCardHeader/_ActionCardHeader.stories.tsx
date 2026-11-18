
import { ActionCardHeader, ActionCardHeaderProps } from "./ActionCardHeader";
import React from "react";
import {SbDecorator} from "@test-utils/get-storybook-decorator";


export default {
  ...SbDecorator({
  title: "Vanguard/ActionCard/ActionCardHeader",
  component: ActionCardHeader,
}),
};

export const ActionCardHeaderStory = (props:ActionCardHeaderProps) => {
  return (
    <div >
        <ActionCardHeader {...props}>ImplementME</ActionCardHeader>
    </div>
  );
};

