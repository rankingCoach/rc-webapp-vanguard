
import { ActionCardActions, ActionCardActionsProps } from "./ActionCardActions";
import React from "react";
import {SbDecorator} from "@test-utils/get-storybook-decorator";


export default {
  ...SbDecorator({
  title: "Vanguard/ActionCard/ActionCardActions",
  component: ActionCardActions,
}),
};

export const ActionCardActionsStory = (props:ActionCardActionsProps) => {
  return (
    <div >
        <ActionCardActions {...props}>ImplementME</ActionCardActions>
    </div>
  );
};

